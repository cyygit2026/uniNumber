const https = require('https');

function getLoc(phone) {
  return new Promise(resolve => {
    https.get('https://cx.shouji.360.cn/phonearea.php?number='+phone, (res) => {
      let d=''; res.on('data', c=>d+=c); res.on('end', () => {
        try { const r=JSON.parse(d); resolve(r.data?{province:r.data.province,city:r.data.city}:''); } catch(e) { resolve(''); }
      });
    }).on('error', () => resolve(''));
  });
}

// 直接测试四川省各城市的号段
const testSegments = {
  '成都市': ['1390817', '1398000', '1388000'],
  '绵阳市': ['1390811', '1380811', '1880811'],
  '德阳市': ['1390810', '1380810', '1880810'],
  '广元市': ['1390812', '1380812', '1880812'],
  '乐山市': ['1390813', '1380813', '1880813'],
  '攀枝花市': ['1390814', '1380814', '1880814'],
  '凉山彝族自治州': ['1390815', '1370814', '1880815']
};

(async () => {
  console.log('=== 四川省城市号段测试 ===');
  let errors = 0;
  
  for(const [city, segs] of Object.entries(testSegments)) {
    console.log('\n' + city + ':');
    for(const seg of segs) {
      const loc = await getLoc(seg + '0000');
      await new Promise(r=>setTimeout(r, 30));
      
      const cityName = city.replace('市', '').replace('彝族自治州', '').replace('藏族羌族自治州', '').replace('藏族自治州', '');
      if (loc && !loc.city.includes(cityName)) {
        console.log('  ✗ ' + seg + ' -> ' + loc.city);
        errors++;
      } else {
        console.log('  ✓ ' + seg + ' -> ' + (loc ? loc.city : '未知'));
      }
    }
  }
  
  console.log('\n=== 测试结果 ===');
  console.log(errors + ' 个错误');
})();
