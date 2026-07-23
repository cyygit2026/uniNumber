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

// 测试陕西省各城市的号段
const testSegments = {
  '西安市': ['1830295', '1390918', '1590290'],
  '商洛市': ['1390914', '1350914', '1330914'],
  '宝鸡市': ['1390917', '1380917', '1330917'],
  '咸阳市': ['1390910', '1380910', '1330910'],
  '延安市': ['1390911', '1380911', '1330911'],
  '榆林市': ['1390912', '1380912', '1330912'],
  '汉中市': ['1390916', '1380916', '1330916'],
  '安康市': ['1390915', '1370915', '1330915'],
  '渭南市': ['1390913', '1380913', '1330913'],
  '铜川市': ['1390919', '1350919', '1330919']
};

(async () => {
  console.log('=== 陕西省城市号段测试 ===');
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
