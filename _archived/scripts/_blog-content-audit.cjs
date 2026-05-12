const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
(async () => {
  const {data} = await sb.from('blog_posts')
    .select('slug_es,slug_en,title_es,primary_keyword_es,primary_keyword_en,service_type,published_at')
    .eq('status','published')
    .order('published_at',{ascending:false});

  // Group by service_type
  const byService = {};
  data.forEach(p => {
    const s = p.service_type || 'uncategorized';
    if (!byService[s]) byService[s] = [];
    byService[s].push(p.primary_keyword_es || p.slug_es);
  });
  console.log('=== Posts by service_type ===');
  Object.entries(byService).forEach(([s,posts]) => {
    console.log(s + ' (' + posts.length + ')');
    posts.forEach(k => console.log('  -', k));
  });

  const pricing = data.filter(p =>
    (p.primary_keyword_es||'').match(/precio|costo|cuesta|cobr/i) ||
    (p.title_es||'').match(/precio|costo|cuesta|cobr/i)
  );
  console.log('\n=== Existing pricing/cost posts:', pricing.length, '===');
  pricing.forEach(p => console.log(' -', p.primary_keyword_es || p.title_es));

  const comparison = data.filter(p =>
    (p.primary_keyword_es||'').match(/mejor|elegir|diferencia|confiable/i) ||
    (p.title_es||'').match(/mejor|elegir|diferencia|confiable/i)
  );
  console.log('\n=== Comparison/trust posts:', comparison.length, '===');

  const {data: withUrl} = await sb.from('blog_posts')
    .select('slug_es,setmore_service_url')
    .eq('status','published')
    .not('setmore_service_url','is',null);
  console.log('\n=== Posts with booking URL:', withUrl?.length, '===');
})();
