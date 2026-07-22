const https = require('https');

const provinces = [
    "北京市", "天津市", "河北省", "山西省", "内蒙古自治区",
    "辽宁省", "吉林省", "黑龙江省", "上海市", "江苏省",
    "浙江省", "安徽省", "福建省", "江西省", "山东省",
    "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区",
    "海南省", "重庆市", "四川省", "贵州省", "云南省",
    "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区",
    "新疆维吾尔自治区"
];

const operators = {
    "中国移动": ["134", "135", "136", "137", "138", "139", "150", "151", "152", "157", "158", "159", "182", "183", "184", "187", "188", "198"],
    "中国联通": ["130", "131", "132", "155", "156", "166", "175", "176", "185", "186"],
    "中国电信": ["133", "153", "173", "177", "180", "181", "189", "199"]
};

function getLocationFromAPI(phone) {
    return new Promise((resolve) => {
        https.get(`https://cx.shouji.360.cn/phonearea.php?number=${phone}`, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.code === 0 && result.data) {
                        resolve({ province: result.data.province, city: result.data.city });
                    } else {
                        resolve(null);
                    }
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => {
            resolve(null);
        });
    });
}

function normalizeProvince(name) {
    const map = {
        "北京": "北京市", "天津": "天津市", "上海": "上海市", "重庆": "重庆市",
        "河北": "河北省", "山西": "山西省", "辽宁": "辽宁省", "吉林": "吉林省",
        "黑龙江": "黑龙江省", "江苏": "江苏省", "浙江": "浙江省", "安徽": "安徽省",
        "福建": "福建省", "江西": "江西省", "山东": "山东省", "河南": "河南省",
        "湖北": "湖北省", "湖南": "湖南省", "广东": "广东省", "海南": "海南省",
        "四川": "四川省", "贵州": "贵州省", "云南": "云南省", "陕西": "陕西省",
        "甘肃": "甘肃省", "青海": "青海省",
        "内蒙古": "内蒙古自治区", "广西": "广西壮族自治区", "西藏": "西藏自治区",
        "宁夏": "宁夏回族自治区", "新疆": "新疆维吾尔自治区"
    };
    return map[name] || name;
}

async function collectSegments() {
    const result = {};
    let totalChecked = 0;
    
    for (const province of provinces) {
        result[province] = {};
        for (const [opName, prefixes] of Object.entries(operators)) {
            result[province][opName] = [];
            
            for (const prefix of prefixes) {
                for (let i = 0; i < 20; i++) {
                    const suffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                    const segment = prefix + suffix;
                    const phone = segment + '0000';
                    const location = await getLocationFromAPI(phone);
                    
                    totalChecked++;
                    if (totalChecked % 50 === 0) {
                        console.log(`已检查: ${totalChecked} 个号段`);
                    }
                    
                    if (location) {
                        const normalizedProvince = normalizeProvince(location.province);
                        if (normalizedProvince === province) {
                            result[province][opName].push(segment);
                        }
                    }
                    
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            result[province][opName] = [...new Set(result[province][opName])].sort();
            console.log(`${province} ${opName}: ${result[province][opName].length} 个号段`);
        }
    }
    
    console.log('\n数据已保存到 segments_data.json');
    require('fs').writeFileSync('segments_data.json', JSON.stringify(result, null, 4));
}

collectSegments();