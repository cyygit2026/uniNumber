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

const nameMap = {
  '广西壮族': '广西',
  '宁夏回族': '宁夏',
  '新疆维吾尔': '新疆',
  '海南': '海南省'
};

async function verifyProvince(name, segments) {
  let errors = [];
  const expectedProvince = nameMap[name] || name;
  
  for (const [carrier, segs] of Object.entries(segments)) {
    for (const seg of segs.slice(0, 5)) {
      const phone = seg + '0000';
      const loc = await getLoc(phone);
      await sleep(20);
      if (loc) {
        const apiProvince = loc.province.replace('省', '').replace('自治区', '').replace('市', '');
        if (apiProvince === expectedProvince || loc.province.includes(expectedProvince)) {
          console.log(`✓ ${phone} -> ${loc.province} ${loc.city}`);
        } else {
          errors.push(`✗ ${phone} -> ${loc.province} ${loc.city} (期望: ${expectedProvince})`);
        }
      } else {
        errors.push(`? ${phone} -> 未知 (期望: ${expectedProvince})`);
      }
    }
  }
  return errors;
}

async function main() {
  const fs = require('fs');
  const html = fs.readFileSync('index.html', 'utf-8');
  const match = html.match(/const phoneSegments = (\{[\s\S]*?\});/);
  
  if (!match) {
    console.log('无法找到phoneSegments数据');
    return;
  }
  
  try {
    const data = JSON.parse(match[1]);
    const provinces = Object.keys(data);
    
    console.log(`共发现 ${provinces.length} 个省份\n`);
    
    for (const province of provinces) {
      console.log(`=== 验证 ${province} ===`);
      const segments = data[province];
      const provinceShort = province.replace('省', '').replace('自治区', '').replace('市', '');
      
      const firstKey = Object.keys(segments)[0];
      if (firstKey && ['中国移动', '中国联通', '中国电信'].includes(firstKey)) {
        const errors = await verifyProvince(provinceShort, segments);
        if (errors.length > 0) {
          console.log('\n错误:');
          errors.forEach(e => console.log(e));
        }
      } else {
        for (const city of Object.keys(segments)) {
          const citySegments = segments[city];
          console.log(`\n${city}:`);
          const errors = await verifyProvince(provinceShort, citySegments);
          if (errors.length > 0) {
            console.log('错误:');
            errors.forEach(e => console.log(e));
          }
        }
      }
      console.log('\n');
    }
  } catch (e) {
    console.log('解析数据失败:', e.message);
  }
}

main();
