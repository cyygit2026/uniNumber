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

// 收集陕西省各城市的真实号段
const prefixes = ['139091', '139092', '139093', '139094', '139095', '139096', '139097', '139098', '139099',
                  '138091', '138092', '138093', '138094', '138095', '138096', '138097', '138098', '138099',
                  '137091', '137092', '137093', '137094', '137095', '137096', '137097', '137098', '137099',
                  '136091', '136092', '136093', '136094', '136095', '136096', '136097', '136098', '136099',
                  '135091', '135092', '135093', '135094', '135095', '135096', '135097', '135098', '135099',
                  '134029', '159029', '158029', '157029', '152029', '151029', '150029',
                  '188029', '187029', '183029', '182029', '198029',
                  '133091', '153091', '173091', '177091', '180091', '181091', '189091', '199091',
                  '155029', '185029', '176029', '166029'];

(async () => {
  console.log('收集陕西省各城市号段数据:');
  const citySegments = {};
  
  for(const p of prefixes) {
    for(let i=0; i<=9; i++) {
      const phone = p + i + '0000';
      const loc = await getLoc(phone);
      if (loc && loc.province && loc.city && loc.province.includes('陕西')) {
        const city = loc.city;
        if (!citySegments[city]) citySegments[city] = [];
        if (!citySegments[city].includes(p+i)) {
          citySegments[city].push(p+i);
        }
      }
      await new Promise(r=>setTimeout(r, 30));
    }
  }
  
  for(const [city, segs] of Object.entries(citySegments)) {
    console.log(city + ': ' + segs.join(', '));
  }
})();
