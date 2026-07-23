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

// 收集广西壮族自治区各城市的真实号段
const prefixes = ['139770', '139771', '139772', '139773', '139774', '139775', '139776', '139777', '139778', '139779',
                  '138770', '138771', '138772', '138773', '138774', '138775', '138776', '138777', '138778', '138779',
                  '137077', '136077', '135077', '134077',
                  '159770', '159771', '159772', '159773', '159774', '159775', '159776', '159777', '159778', '159779',
                  '158770', '158771', '158772', '158773', '158774', '158775', '158776', '158777', '158778', '158779',
                  '157770', '157771', '157772', '157773', '157774', '157775', '157776', '157777', '157778', '157779',
                  '188770', '188771', '188772', '188773', '188774', '188775', '188776', '188777', '188778', '188779',
                  '187770', '187771', '187772', '187773', '187774', '187775', '187776', '187777', '187778', '187779',
                  '183770', '183771', '183772', '183773', '183774', '183775', '183776', '183777', '183778', '183779',
                  '182770', '182771', '182772', '182773', '182774', '182775', '182776', '182777', '182778', '182779',
                  '133077', '153077', '173077', '177077', '180077', '181077', '189077', '189770', '199077',
                  '155077', '185077', '175077', '166077'];

(async () => {
  console.log('收集广西壮族自治区各城市号段数据:');
  const citySegments = {};
  
  for(const p of prefixes) {
    for(let i=0; i<=9; i++) {
      const phone = p + i + '0000';
      const loc = await getLoc(phone);
      if (loc && loc.province && loc.city && loc.province.includes('广西')) {
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
