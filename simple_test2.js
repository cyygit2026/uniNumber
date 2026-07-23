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

// 测试广西壮族自治区各城市的号段
const testSegments = {
  '南宁市': ['1397710', '1387710', '1597710'],
  '柳州市': ['1397721', '1387720', '1597723'],
  '桂林市': ['1397730', '1387730', '1597730'],
  '防城港市': ['1397700', '1387700', '1577700'],
  '玉林市': ['1397752', '1387750', '1597753'],
  '贵港市': ['1397750', '1597704', '1887702']
};

(async () => {
  console.log('=== 广西壮族自治区城市号段测试 ===');
  let errors = 0;
  
  for(const [city, segs] of Object.entries(testSegments)) {
    console.log('\n' + city + ':');
    for(const seg of segs) {
      const loc = await getLoc(seg + '0000');
      await new Promise(r=>setTimeout(r, 30));
      
      const cityName = city.replace('市', '');
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
