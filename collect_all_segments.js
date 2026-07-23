const https = require('https');
const fs = require('fs');

function getLoc(phone) {
  return new Promise(resolve => {
    https.get('https://cx.shouji.360.cn/phonearea.php?number='+phone, (res) => {
      let d=''; res.on('data', c=>d+=c); res.on('end', () => {
        try { const r=JSON.parse(d); resolve(r.data?{province:r.data.province,city:r.data.city}:''); } catch(e) { resolve(''); }
      });
    }).on('error', () => resolve(''));
  });
}

// 省份和城市列表
const provinces = {
    "北京市": ["北京"],
    "天津市": ["天津"],
    "河北省": ["石家庄", "唐山", "秦皇岛", "邯郸", "邢台", "保定", "张家口", "承德", "沧州", "廊坊", "衡水"],
    "山西省": ["太原", "大同", "阳泉", "长治", "晋城", "朔州", "晋中", "运城", "忻州", "临汾", "吕梁"],
    "内蒙古自治区": ["呼和浩特", "包头", "乌海", "赤峰", "通辽", "鄂尔多斯", "呼伦贝尔", "巴彦淖尔", "乌兰察布"],
    "辽宁省": ["沈阳", "大连", "鞍山", "抚顺", "本溪", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "朝阳", "葫芦岛"],
    "吉林省": ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城"],
    "黑龙江省": ["哈尔滨", "齐齐哈尔", "鸡西", "鹤岗", "双鸭山", "大庆", "伊春", "佳木斯", "七台河", "牡丹江", "黑河"],
    "上海市": ["上海"],
    "江苏省": ["南京", "无锡", "徐州", "常州", "苏州", "南通", "连云港", "淮安", "盐城", "扬州", "镇江", "泰州", "宿迁"],
    "浙江省": ["杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "金华", "衢州", "舟山", "台州", "丽水"],
    "安徽省": ["合肥", "芜湖", "蚌埠", "淮南", "马鞍山", "淮北", "铜陵", "安庆", "黄山", "滁州", "阜阳", "宿州", "六安", "亳州", "池州", "宣城"],
    "福建省": ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
    "江西省": ["南昌", "景德镇", "萍乡", "九江", "新余", "鹰潭", "赣州", "吉安", "宜春", "抚州", "上饶"],
    "山东省": ["济南", "青岛", "淄博", "枣庄", "东营", "烟台", "潍坊", "济宁", "泰安", "威海", "日照", "莱芜", "临沂", "德州", "聊城", "滨州", "菏泽"],
    "河南省": ["郑州", "开封", "洛阳", "平顶山", "安阳", "鹤壁", "新乡", "焦作", "濮阳", "许昌", "漯河", "三门峡", "南阳", "商丘", "信阳", "周口", "驻马店"],
    "湖北省": ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州"],
    "湖南省": ["长沙", "株洲", "湘潭", "衡阳", "邵阳", "岳阳", "常德", "张家界", "益阳", "郴州", "永州", "怀化", "娄底"],
    "广东省": ["广州", "韶关", "深圳", "珠海", "汕头", "佛山", "江门", "湛江", "茂名", "肇庆", "惠州", "梅州", "汕尾", "河源", "阳江", "清远", "东莞", "中山", "潮州", "揭阳", "云浮"],
    "广西壮族自治区": ["南宁", "柳州", "桂林", "梧州", "北海", "防城港", "钦州", "贵港", "玉林", "百色", "贺州", "河池", "来宾", "崇左"],
    "海南省": ["海口", "三亚"],
    "重庆市": ["重庆"],
    "四川省": ["成都", "自贡", "攀枝花", "泸州", "德阳", "绵阳", "广元", "遂宁", "内江", "乐山", "南充", "眉山", "宜宾", "广安", "达州", "雅安", "巴中", "资阳"],
    "贵州省": ["贵阳", "六盘水", "遵义", "安顺", "毕节", "铜仁", "黔西南", "黔东南", "黔南"],
    "云南省": ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧"],
    "西藏自治区": ["拉萨"],
    "陕西省": ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
    "甘肃省": ["兰州", "嘉峪关", "金昌", "白银", "天水", "武威", "张掖", "平凉", "酒泉", "庆阳", "定西", "陇南"],
    "青海省": ["西宁"],
    "宁夏回族自治区": ["银川", "石嘴山", "吴忠", "固原", "中卫"],
    "新疆维吾尔自治区": ["乌鲁木齐", "克拉玛依"]
};

// 号段前缀列表（6位）
const prefixes = [];
// 中国移动号段前缀
const cmccPrefixes = ['134', '135', '136', '137', '138', '139', '150', '151', '152', '157', '158', '159', '182', '183', '184', '187', '188', '198'];
// 中国联通号段前缀
const cuccPrefixes = ['130', '131', '132', '155', '156', '166', '175', '176', '185', '186'];
// 中国电信号段前缀
const ctccPrefixes = ['133', '153', '173', '177', '180', '181', '189', '199'];

for(const pre of cmccPrefixes) {
    for(let i=0; i<=999; i++) {
        prefixes.push(pre + i.toString().padStart(3, '0'));
    }
}

(async () => {
    console.log('开始收集所有省份的真实号段数据...');
    const results = {};
    
    for(const [province, cities] of Object.entries(provinces)) {
        results[province] = {};
        for(const city of cities) {
            results[province][city] = { '中国移动': [], '中国联通': [], '中国电信': [] };
        }
    }
    
    let count = 0;
    for(const prefix of prefixes) {
        const phone = prefix + '0000';
        const loc = await getLoc(phone);
        count++;
        
        if (loc && loc.province && loc.city) {
            const province = loc.province;
            const city = loc.city;
            
            // 找到对应的省份
            let matchedProvince = null;
            for(const [p, cities] of Object.entries(provinces)) {
                if (p.includes(province) || province.includes(p)) {
                    matchedProvince = p;
                    break;
                }
            }
            
            if (matchedProvince) {
                // 找到对应的城市
                let matchedCity = null;
                for(const c of provinces[matchedProvince]) {
                    if (city.includes(c) || c.includes(city)) {
                        matchedCity = c;
                        break;
                    }
                }
                
                if (!matchedCity && provinces[matchedProvince].length === 1) {
                    matchedCity = provinces[matchedProvince][0];
                }
                
                if (matchedCity) {
                    // 判断运营商
                    let operator = '中国移动';
                    if (cuccPrefixes.includes(prefix.substring(0, 3))) {
                        operator = '中国联通';
                    } else if (ctccPrefixes.includes(prefix.substring(0, 3))) {
                        operator = '中国电信';
                    }
                    
                    if (!results[matchedProvince][matchedCity][operator].includes(prefix)) {
                        results[matchedProvince][matchedCity][operator].push(prefix);
                    }
                }
            }
        }
        
        await new Promise(r => setTimeout(r, 20));
        
        if (count % 1000 === 0) {
            console.log(`已处理 ${count}/${prefixes.length} 个号段`);
        }
    }
    
    // 保存结果
    fs.writeFileSync('real_segments.json', JSON.stringify(results, null, 2));
    console.log('收集完成！结果已保存到 real_segments.json');
})();
