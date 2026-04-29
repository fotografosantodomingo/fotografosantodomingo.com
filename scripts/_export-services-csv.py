#!/usr/bin/env python3
"""
Build CSVs of the live service catalog for Tawk.to knowledge-base import.

Produces three files in _exports/:
  - tawk-knowledge-base-en.csv   one row per English KB article
  - tawk-knowledge-base-es.csv   one row per Spanish KB article
  - services-catalog-raw.csv     full row-level dump (every column, both langs)

Tawk.to CSV import format (Admin → Knowledge Base → Import):
  Title, Content, Category, Tags
The HTML in Content is what Tawk renders inside each article. Categories
double as the navigation tree, so we use the family display title.

Run after `curl` populates /tmp/families.json + /tmp/packages.json.
"""
import csv
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '_exports'
OUT.mkdir(exist_ok=True)

families = json.load(open('/tmp/families.json'))
packages = json.load(open('/tmp/packages.json'))

fam_by_id = {f['id']: f for f in families}

BASE_URL = 'https://www.fotografosantodomingo.com'


def fmt_price(p):
    n = float(p)
    if n == 0:
        return 'Custom quote'
    return f'${n:,.0f} USD'


def fmt_duration(mins):
    if mins is None:
        return ''
    if mins % 60 == 0:
        h = mins // 60
        return f'{h}h' if h > 1 else f'{h} hour'
    return f'{mins} min'


def html_escape(s):
    return (
        (s or '')
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;')
    )


def build_article_html(pkg, fam, lang):
    """Render the package as an HTML KB article body."""
    is_es = lang == 'es'
    name = pkg[f'name_{lang}'] or pkg['name_en']
    desc = pkg.get(f'description_short_{lang}') or pkg.get('description_short_en') or ''
    inclusions = pkg.get(f'inclusions_{lang}') or pkg.get('inclusions_en') or []
    fam_title = fam[f'title_{lang}'] or fam['title_en']
    fam_slug = fam['slug']
    pkg_slug = pkg['slug']

    price = fmt_price(pkg['starting_price_usd'])
    dur = fmt_duration(pkg.get('duration_min'))
    photos = pkg.get('photo_count')
    deposit = pkg.get('deposit_percent')
    bookable = pkg.get('bookable_direct')

    book_url = f'{BASE_URL}/{lang}/book?service={fam_slug}__{pkg_slug}'
    quote_url = f'{BASE_URL}/{lang}/get-quote?family={fam_slug}&package={pkg_slug}'
    family_url = f'{BASE_URL}/{lang}/services/{fam_slug}'

    label_book = 'Book online' if not is_es else 'Reservar online'
    label_quote = 'Request a custom quote' if not is_es else 'Pedir cotización personalizada'
    label_family = 'Browse the family' if not is_es else 'Ver familia'
    label_price = 'Starting price' if not is_es else 'Precio desde'
    label_duration = 'Duration' if not is_es else 'Duración'
    label_photos = 'Edited photos delivered' if not is_es else 'Fotos editadas entregadas'
    label_deposit = 'Deposit to confirm' if not is_es else 'Depósito para reservar'
    label_includes = 'What\'s included' if not is_es else 'Qué incluye'
    label_family_label = 'Service family' if not is_es else 'Familia de servicio'

    parts = [f'<h2>{html_escape(name)}</h2>']
    if desc:
        parts.append(f'<p>{html_escape(desc)}</p>')

    parts.append('<table>')
    parts.append(f'<tr><td><strong>{label_family_label}</strong></td><td>{html_escape(fam_title)}</td></tr>')
    parts.append(f'<tr><td><strong>{label_price}</strong></td><td>{price}</td></tr>')
    if dur:
        parts.append(f'<tr><td><strong>{label_duration}</strong></td><td>{dur}</td></tr>')
    if photos:
        parts.append(f'<tr><td><strong>{label_photos}</strong></td><td>{photos}</td></tr>')
    if bookable and deposit:
        parts.append(f'<tr><td><strong>{label_deposit}</strong></td><td>{deposit}%</td></tr>')
    parts.append('</table>')

    if inclusions:
        parts.append(f'<h3>{label_includes}</h3>')
        parts.append('<ul>')
        for inc in inclusions:
            parts.append(f'  <li>{html_escape(inc)}</li>')
        parts.append('</ul>')

    if bookable:
        parts.append(f'<p><a href="{book_url}">{label_book} →</a></p>')
    parts.append(f'<p><a href="{quote_url}">{label_quote} →</a> · <a href="{family_url}">{label_family}</a></p>')

    return ''.join(parts)


def write_tawk_csv(lang):
    out_path = OUT / f'tawk-knowledge-base-{lang}.csv'
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        # Tawk import expects: Title, Content, Category, Tags
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(['Title', 'Content', 'Category', 'Tags'])

        # 1 family-overview article per family
        for fam in sorted(families, key=lambda x: x['sort_order']):
            title_field = f'title_{lang}'
            tagline_field = f'tagline_{lang}'
            fam_title = fam[title_field] or fam['title_en']
            tagline = fam.get(tagline_field) or fam.get('tagline_en') or ''
            fam_pkgs = [p for p in packages if p['family_id'] == fam['id']]
            if not fam_pkgs:
                continue

            content = [f'<h2>{html_escape(fam_title)}</h2>']
            if tagline:
                content.append(f'<p>{html_escape(tagline)}</p>')
            content.append('<h3>' + ('Packages' if lang == 'en' else 'Paquetes') + '</h3>')
            content.append('<ul>')
            for p in sorted(fam_pkgs, key=lambda x: x['sort_order']):
                pname = p[f'name_{lang}'] or p['name_en']
                price = fmt_price(p['starting_price_usd'])
                dur = fmt_duration(p['duration_min'])
                content.append(f'  <li><strong>{html_escape(pname)}</strong> — {price}{(" · " + dur) if dur else ""}</li>')
            content.append('</ul>')
            content.append(
                f'<p><a href="{BASE_URL}/{lang}/services/{fam["slug"]}">'
                + ('See full family' if lang == 'en' else 'Ver familia completa')
                + ' →</a></p>'
            )
            w.writerow([
                fam_title,
                ''.join(content),
                'Services overview' if lang == 'en' else 'Resumen de servicios',
                ','.join(filter(None, [fam['slug'], 'overview' if lang == 'en' else 'resumen']))
            ])

        # 1 article per package
        for pkg in sorted(packages, key=lambda x: (fam_by_id[x['family_id']]['sort_order'], x['sort_order'])):
            fam = fam_by_id[pkg['family_id']]
            name = pkg[f'name_{lang}'] or pkg['name_en']
            fam_title = fam[f'title_{lang}'] or fam['title_en']

            tags = [
                fam['slug'],
                pkg['slug'],
                'bookable' if pkg.get('bookable_direct') else 'quote-only',
            ]
            if pkg.get('popular_badge'):
                tags.append(pkg['popular_badge'].replace('_', '-'))
            if pkg.get('featured'):
                tags.append('featured')
            for la in (pkg.get('legacy_aliases') or []):
                tags.append(la)

            w.writerow([
                name,
                build_article_html(pkg, fam, lang),
                fam_title,
                ','.join(sorted(set(tags)))
            ])
    return out_path


def write_raw_csv():
    """Single CSV with every field side-by-side ES + EN for spreadsheet edits."""
    out_path = OUT / 'services-catalog-raw.csv'
    cols = [
        'family_slug', 'family_title_es', 'family_title_en',
        'package_slug', 'name_es', 'name_en',
        'description_short_es', 'description_short_en',
        'starting_price_usd', 'duration_min', 'photo_count',
        'deposit_percent', 'bookable_direct', 'custom_quote_allowed',
        'featured', 'popular_badge', 'sort_order',
        'inclusions_es', 'inclusions_en',
        'legacy_aliases',
        'book_url_en', 'book_url_es',
        'family_url_en', 'family_url_es',
    ]
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(cols)
        for pkg in sorted(packages, key=lambda x: (fam_by_id[x['family_id']]['sort_order'], x['sort_order'])):
            fam = fam_by_id[pkg['family_id']]
            book_en = f'{BASE_URL}/en/book?service={fam["slug"]}__{pkg["slug"]}'
            book_es = f'{BASE_URL}/es/book?service={fam["slug"]}__{pkg["slug"]}'
            family_en = f'{BASE_URL}/en/services/{fam["slug"]}'
            family_es = f'{BASE_URL}/es/services/{fam["slug"]}'
            w.writerow([
                fam['slug'], fam['title_es'], fam['title_en'],
                pkg['slug'], pkg['name_es'], pkg['name_en'],
                pkg.get('description_short_es') or '', pkg.get('description_short_en') or '',
                pkg['starting_price_usd'], pkg['duration_min'], pkg.get('photo_count') or '',
                pkg.get('deposit_percent') or '', pkg.get('bookable_direct'), pkg.get('custom_quote_allowed'),
                pkg.get('featured'), pkg.get('popular_badge') or '', pkg.get('sort_order'),
                ' | '.join(pkg.get('inclusions_es') or []),
                ' | '.join(pkg.get('inclusions_en') or []),
                ','.join(pkg.get('legacy_aliases') or []),
                book_en if pkg.get('bookable_direct') else '',
                book_es if pkg.get('bookable_direct') else '',
                family_en, family_es,
            ])
    return out_path


def main():
    en_path = write_tawk_csv('en')
    es_path = write_tawk_csv('es')
    raw_path = write_raw_csv()
    print(f'  ✓ {en_path.relative_to(ROOT)}  ({en_path.stat().st_size:,} bytes)')
    print(f'  ✓ {es_path.relative_to(ROOT)}  ({es_path.stat().st_size:,} bytes)')
    print(f'  ✓ {raw_path.relative_to(ROOT)}  ({raw_path.stat().st_size:,} bytes)')
    print()
    print(f'  Articles per locale: {len(families)} family overviews + {len(packages)} packages = {len(families) + len(packages)}')


if __name__ == '__main__':
    main()
