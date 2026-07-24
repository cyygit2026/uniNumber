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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function verifySegments(segments, expectedProvince) {
  let valid = [];
  for (const seg of segments) {
    const phone = seg + '0000';
    const loc = await getLoc(phone);
    await sleep(20);
    if (loc && loc.province === expectedProvince) {
      valid.push(seg);
      console.log(`✓ ${seg} -> ${loc.province} ${loc.city}`);
    } else if (loc) {
      console.log(`✗ ${seg} -> ${loc.province} ${loc.city}`);
    } else {
      console.log(`? ${seg} -> 未知`);
    }
  }
  return valid;
}

(async () => {
  const gdSegments = {
    '中国移动': ['134028', '135098', '136000', '136001', '136002', '136003', '136004', '136005', '136006', '136007', '136008', '136009', '136023', '136024', '136025', '136026', '136027', '136028', '136029'],
    '中国联通': ['130000', '130001', '130002', '130003', '130004', '130005', '130006', '130007', '130008', '130009'],
    '中国电信': ['133000', '133001', '133002', '133003', '133004', '133005', '133006', '133007', '133008', '133009']
  };

  console.log('=== 验证广东省号段 ===\n');
  
  for (const [carrier, segs] of Object.entries(gdSegments)) {
    console.log(`${carrier}:`);
    await verifySegments(segs, '广东');
    console.log('');
  }
})();
