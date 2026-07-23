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

// 简单测试云南省各城市的号段
const testSegments = {
  '昆明市': ['1390871', '1388800', '1588700'],
  '昭通市': ['1390870', '1598700', '1528700'],
  '曲靖市': ['1390874', '1340870', '1590874'],
  '玉溪市': ['1390877', '1510870', '1598707'],
  '普洱市': ['1390879', '1500870', '1880879'],
  '大理白族自治州': ['1390872', '1380876', '1590872']
};

(async () => {
  console.log('=== 云南省城市号段测试 ===');
  let errors = 0;
  
  for(const [city, segs] of Object.entries(testSegments)) {
    console.log('\n' + city + ':');
    for(const seg of segs) {
      const loc = await getLoc(seg + '0000');
      await new Promise(r=>setTimeout(r, 30));
      
      if (loc && !loc.city.includes(city.replace('市', '').replace('白族自治州', '').replace('彝族自治州', ''))) {
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
