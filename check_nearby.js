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

// 收集云南省各城市的真实号段
const prefixes = ['139087', '138087', '137087', '136087', '135087', '134087', '159087', '158087', '157087', '152087', '151087', '150087', '188087', '187087', '183087', '182087', '198087', '139880', '138880', '137880', '159870', '158870', '152870', '151870', '150870', '188870', '187870', '183870', '182870', '198870', '133087', '153087', '173087', '177087', '180087', '181087', '189087', '189870', '199087', '155087', '155870', '185087', '175087', '166087'];

(async () => {
  console.log('收集云南省各城市号段数据:');
  const citySegments = {};
  
  for(const p of prefixes) {
    for(let i=0; i<=9; i++) {
      const phone = p + i + '0000';
      const loc = await getLoc(phone);
      if (loc && loc.province && loc.city && loc.province.includes('云南')) {
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
