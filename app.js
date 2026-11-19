(function () {
  'use strict';

  const D = window.PKU_DATA;
  const LS = 'pku_lecture_v1';
  const ROLE_KEY = 'pku_lecture_role';
  const SLOTS = {
    am: { key: 'am', label: '上午', time: '09:30–11:30', start: '09:30' },
    pm: { key: 'pm', label: '下午', time: '14:00–16:00', start: '14:00' },
    eve: { key: 'eve', label: '晚间', time: '19:00–20:30', start: '19:00' }
  };
  const STATUS = {
    pending: { label: '待院方回复', cls: 'pending', hero: '等待院方确认', sub: '院方正在匹配讲者与课题，通常 1 个工作日内回复' },
    replied: { label: '院方已回复', cls: 'replied', hero: '院方已回复方案', sub: '请查看课题、流程与时间安排，并确认活动方案' },
    confirmed: { label: '已确认', cls: 'confirmed', hero: '活动方案已确认', sub: '请按约定时间开展活动，院方对接人将提前与您联系' },
    cancelled: { label: '已取消', cls: 'cancelled', hero: '预约已取消', sub: '该预约已关闭，如需重新预约请选择新的时间' }
  };
  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const addDays = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
  const parseYmd = s => { const a = String(s).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const fmtMD = d => (d.getMonth() + 1) + '月' + d.getDate() + '日';
  const dateCN = s => { const d = parseYmd(s); return fmtMD(d) + ' ' + WEEK[d.getDay()]; };
  const dateShort = s => { const d = parseYmd(s); return (d.getMonth() + 1) + '/' + d.getDate(); };
  const nowHM = ts => { const d = new Date(ts); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const timeAgo = ts => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    const d = new Date(ts), n = new Date();
    if (ymd(d) === ymd(n)) return '今天 ' + nowHM(ts);
    if (ymd(d) === ymd(addDays(n, -1))) return '昨天 ' + nowHM(ts);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  };
  const maskPhone = p => String(p || '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

  const IC = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    steth: '<path d="M5 3v5a5 5 0 0 0 10 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0V9"/><circle cx="20" cy="6" r="3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    arrow: '<path d="M9 18l6-6-6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 19c0-2.5 1.5-4 3.5-4 1.2 0 2.2.4 2.8 1"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    phone: '<path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4c0 1-1 2-2 2C9 22 2 15 2 6c0-1 1-2 2-2z"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5v-3h.5A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9L6.6 8l2-2 .1.1A1.7 1.7 0 0 0 10.6 6a1.7 1.7 0 0 0 1-1.5V4h3v.5a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1A1.7 1.7 0 0 0 19 10c.2.6.7 1 1.5 1h.5v3h-.5c-.8 0-1.3.4-1.5 1z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.7l6.8-4M8.6 13.3l6.8 4"/>',
    pin: '<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    alert: '<path d="M12 3l9 17H3L12 3z"/><path d="M12 9v4M12 17h.01"/>',
    msg: '<path d="M21 11.5a7.5 7.5 0 0 1-8 7.5 8 8 0 0 1-3-.6L4 20l1.2-4A7.5 7.5 0 1 1 21 11.5z"/>',
    crown: '<path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z"/><path d="M5 20h14"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
    heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.3a5 5 0 0 0 0-7.1z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    talk: '<path d="M21 11.5a7.5 7.5 0 0 1-8 7.5 8 8 0 0 1-3-.6L4 20l1.2-4A7.5 7.5 0 1 1 21 11.5z"/><path d="M8.5 11h7M8.5 14h4"/>',
    consult: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M14.5 19c0-2.5 1.5-4 3.5-4 1.2 0 2.2.4 2.8 1"/>',
    salon: '<circle cx="7" cy="9" r="2.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2 19c0-2.5 2-4 5-4M12 15c3 0 5 1.5 5 4M12 11v8"/>',
    doc: '<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[name] || '') + '</svg>';
  }

  function defaultSettings() {
    return {
      sms: {
        enabled: true,
        events: { newBooking: true, dailyDigest: true, replyToClient: true, activityReminder: true },
        leadDays: 7,
        recipients: [
          { name: '张老师', phone: '13800138000' },
          { name: '王老师', phone: '13900139000' }
        ],
        templates: {
          newBooking: '【北大医疗国际医院】您有一笔新的入企活动预约：{org} 预约 {doctor}，活动时间 {date} {time}。请登录院方工作台查看并回复方案。单号 {order}。',
          reply: '【北大医疗国际医院】{org} 您好，院方已回复「{doctor}」活动方案：{topic}，时间 {date}。请进入预约详情查看并确认。单号 {order}。',
          reminder: '【北大医疗国际医院】提醒：{org} 与 {doctor} 的活动将于 {date} {time} 开展，请提前确认场地、流程与到场安排。',
          digest: '【北大医疗国际医院】今日待回复预约 {n} 笔，请及时登录院方工作台处理。'
        },
        logs: []
      }
    };
  }

  function seedDB() {
    const t = today();
    const biz = n => { let d = addDays(t, n); while (d.getDay() === 0) d = addDays(d, 1); return ymd(d); };
    const d1 = biz(30), d2 = biz(16), d3 = biz(8), d4 = biz(21);
    const ts = (daysAgo, h, m) => { const d = addDays(t, -daysAgo); d.setHours(h, m, 0, 0); return d.getTime(); };
    const compact = d => d.replace(/-/g, '');
    const created1 = ts(0, 9, 12), created2 = ts(3, 15, 40), created3 = ts(6, 10, 5), created4 = ts(9, 16, 20);
    const b1 = {
      id: 'PKU-' + compact(ymd(addDays(t, 0))) + '-001', createdAt: created1,
      clientType: '保险公司', org: '中国平安产险北京分公司', format: '专家讲座', city: '北京',
      address: '朝阳区建国门外大街 1 号国贸写字楼 2 座', people: 120,
      topic: '心血管急症的识别与现场处置', note: '希望结合保险代理人日常拜访场景，增加突发心梗、脑卒中的现场识别与处置内容。',
      contact: '李女士', phone: '13811886652', email: 'li.na@example.com',
      doctorId: '52080', doctorName: '于存涛', doctorTitle: '教授 主任医师', doctorDept: '心外科', doctorPhoto: 'assets/team/52080.webp', doctorTier: 1,
      date: d1, slot: 'am', status: 'pending', plan: null
    };
    const b2 = {
      id: 'PKU-' + compact(ymd(addDays(t, -3))) + '-002', createdAt: created2,
      clientType: '企业', org: '国家电网 · 华东分部', format: '专家讲座', city: '上海',
      address: '浦东新区源深路 1122 号', people: 200,
      topic: '高血压的长期管理', note: '员工平均年龄 41 岁，希望增加血压自测与用药依从性的内容。',
      contact: '周先生', phone: '13918007721', email: 'zhou@example.com',
      doctorId: '1025', doctorName: '刘小慧', doctorTitle: '教授 · 主任医师', doctorDept: '心血管内科', doctorPhoto: 'assets/team/1025.webp', doctorTier: 2,
      date: d2, slot: 'pm', status: 'replied',
      plan: {
        topic: '高血压的长期管理与职场干预',
        outline: '结合企业员工体检数据与真实案例，围绕高血压的早期识别、长期用药、生活方式干预展开，并安排现场答疑。',
        agenda: [
          { time: '14:00', item: '签到与开场', owner: '企业方' },
          { time: '14:10', item: '专家主题分享：高血压的长期管理', owner: '刘小慧' },
          { time: '15:10', item: '互动答疑', owner: '刘小慧 / 企业方' },
          { time: '15:40', item: '一对一咨询', owner: '院方团队' }
        ],
        date: d2, start: '14:00', duration: '120 分钟',
        host: '张老师', hostPhone: '13800138000',
        note: '现场需准备投影、无线麦克风与血压计 2 台；可提供员工血压筛查体验。',
        sentAt: ts(2, 11, 20)
      }
    };
    const b3 = {
      id: 'PKU-' + compact(ymd(addDays(t, -6))) + '-003', createdAt: created3,
      clientType: '保险公司', org: '泰康人寿北京分公司', format: '健康沙龙', city: '北京',
      address: '朝阳区景辉街 16 号泰康金融大厦', people: 60,
      topic: '肥胖与代谢管理', note: '以互动沙龙形式开展，希望安排体脂检测体验。',
      contact: '陈女士', phone: '13601008899', email: 'chen@example.com',
      doctorId: '1078', doctorName: '刘玉芳', doctorTitle: '副主任医师', doctorDept: '内分泌科', doctorPhoto: 'assets/team/1078.webp', doctorTier: 3,
      date: d3, slot: 'pm', status: 'confirmed',
      plan: {
        topic: '肥胖与代谢管理：从体脂到生活方式',
        outline: '围绕体重管理、脂肪肝与代谢风险展开互动式分享，现场提供体脂检测与个体化建议。',
        agenda: [
          { time: '14:00', item: '签到与体脂检测', owner: '院方团队' },
          { time: '14:20', item: '主题分享：肥胖与代谢管理', owner: '刘玉芳' },
          { time: '15:10', item: '互动答疑', owner: '刘玉芳' },
          { time: '15:30', item: '一对一咨询', owner: '院方团队' }
        ],
        date: d3, start: '14:00', duration: '90 分钟',
        host: '王老师', hostPhone: '13900139000',
        note: '已确认场地与设备，院方将提前 40 分钟到场布置。',
        sentAt: ts(5, 14, 10)
      }
    };
    const b4 = {
      id: 'PKU-' + compact(ymd(addDays(t, -9))) + '-004', createdAt: created4,
      clientType: '保险公司', org: '中国太平洋寿险北京分公司', format: '专家咨询', city: '北京',
      address: '西城区金融大街 9 号金融街中心', people: 40,
      topic: '冠心病精准诊疗', note: '高净值客户专场，希望安排一对一问诊。',
      contact: '王先生', phone: '13701234567', email: 'wang@example.com',
      doctorId: '9100', doctorName: '聂绍平', doctorTitle: '教授 · 主任医师', doctorDept: '心血管内科', doctorPhoto: 'assets/team/9100.webp', doctorTier: 2,
      date: d4, slot: 'am', status: 'cancelled', plan: null, cancelledAt: ts(4, 9, 30)
    };
    const bookings = [b1, b2, b3, b4];
    const msgs = [
      { id: 'm1', to: 'client', type: 'reply', title: '院方已回复活动方案', body: '国家电网 · 华东分部：刘小慧教授的活动方案已回复，请查看课题、流程与时间安排。', time: ts(0, 8, 40), read: false, orderId: b2.id },
      { id: 'm2', to: 'client', type: 'confirm', title: '活动方案已确认', body: '泰康人寿北京分公司：11 月 27 日健康沙龙方案已确认，院方将提前与您联系。', time: ts(2, 16, 5), read: true, orderId: b3.id },
      { id: 'm3', to: 'client', type: 'system', title: '欢迎使用专家讲座预约平台', body: '您可以按活动规模选择院士、大咖或专业医生，提交需求后院方将回复完整方案。', time: ts(8, 9, 0), read: true, orderId: '' },
      { id: 'm4', to: 'admin', type: 'new', title: '新的入企活动预约', body: '中国平安产险北京分公司 预约 于存涛教授，活动时间 ' + dateCN(d1) + ' 上午，请及时回复方案。', time: created1, read: false, orderId: b1.id },
      { id: 'm5', to: 'admin', type: 'confirm', title: '客户已确认方案', body: '泰康人寿北京分公司 已确认 刘玉芳医生 的活动方案。', time: ts(2, 16, 5), read: true, orderId: b3.id }
    ];
    const settings = defaultSettings();
    settings.sms.logs = [
      { id: 's1', event: '新预约提醒', toName: '张老师', toPhone: '13800138000', content: '【北大医疗国际医院】您有一笔新的入企活动预约：中国平安产险北京分公司 预约 于存涛，活动时间 ' + dateCN(d1) + ' 上午 09:30–11:30。请登录院方工作台查看并回复方案。单号 ' + b1.id + '。', time: created1 + 2000, status: 'sent' },
      { id: 's2', event: '方案回复通知', toName: '周先生', toPhone: '13918007721', content: '【北大医疗国际医院】国家电网 · 华东分部 您好，院方已回复「刘小慧」活动方案：《高血压的长期管理与职场干预》，时间 ' + dateCN(d2) + '。请进入预约详情查看并确认。单号 ' + b2.id + '。', time: ts(2, 11, 21), status: 'sent' },
      { id: 's3', event: '活动前提醒', toName: '张老师', toPhone: '13800138000', content: '【北大医疗国际医院】提醒：泰康人寿北京分公司 与 刘玉芳 的活动将于 ' + dateCN(d3) + ' 14:00 开展，请提前确认场地、流程与到场安排。', time: ts(1, 18, 0), status: 'sent' }
    ];
    return {
      version: 1,
      seq: 4,
      bookings,
      msgs,
      closed: ['1025|' + biz(36) + '|eve', '52080|' + biz(42) + '|am'],
      settings
    };
  }

  let db;
  function loadDB() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS) || 'null');
      if (raw && raw.version === 1 && Array.isArray(raw.bookings)) {
        const base = defaultSettings();
        raw.settings = raw.settings || base;
        raw.settings.sms = Object.assign(base.sms, raw.settings.sms || {});
        raw.settings.sms.templates = Object.assign(base.sms.templates, (raw.settings.sms.templates || {}));
        raw.settings.sms.events = Object.assign(base.sms.events, (raw.settings.sms.events || {}));
        db = raw;
        return;
      }
    } catch (e) {}
    db = seedDB();
    save();
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(db)); } catch (e) {}
  }
  loadDB();

  function findDoc(id) { return D.doctors.find(d => String(d.id) === String(id)); }
  function findBooking(id) { return db.bookings.find(b => b.id === id); }
  function unread(to) { return db.msgs.filter(m => m.to === to && !m.read).length; }
  function statusPill(s) { const m = STATUS[s] || STATUS.pending; return '<span class="status ' + m.cls + '">' + m.label + '</span>'; }
  function tierBadge(t, extra) {
    const cls = t === 1 ? 't1' : t === 2 ? 't2' : 't3';
    const txt = t === 1 ? '院士 · 大咖' : t === 2 ? '专家咨询 · 主任' : '专业医生';
    return '<span class="badge ' + cls + '">' + (extra || txt) + '</span>';
  }
  function avatar(doc, cls) {
    const ph = doc && doc.group ? '院' : (doc && doc.name ? doc.name.slice(0, 1) : '专');
    if (doc && doc.photo) {
      return '<div class="' + cls + '"><img src="' + esc(doc.photo) + '" alt="' + esc(doc.name) + '" loading="lazy" onerror="this.remove()"></div>';
    }
    return '<div class="' + cls + ' ph">' + esc(ph) + '</div>';
  }
  function bookedSet(doctorId, date) {
    const set = {};
    db.bookings.forEach(b => {
      if (String(b.doctorId) === String(doctorId) && b.date === date && b.status !== 'cancelled') set[b.slot] = true;
    });
    return set;
  }
  function isClosed(doctorId, date, slot) { return db.closed.indexOf(doctorId + '|' + date + '|' + slot) >= 0; }
  function openSlots(doc, date) {
    const booked = bookedSet(doc.id, date);
    return ['am', 'pm', 'eve'].map(k => SLOTS[k]).filter(s => !booked[s.key] && !isClosed(doc.id, date, s.key));
  }
  function availableDates(doc, count) {
    const out = [];
    let d = addDays(today(), Number(doc.leadDays) || 7);
    for (let i = 0; i < 90 && out.length < (count || 10); i++) {
      const x = addDays(d, i);
      if (x.getDay() === 0) continue;
      if (openSlots(doc, ymd(x)).length > 0) out.push(ymd(x));
    }
    return out;
  }
  function firstAvailable(doc) { const a = availableDates(doc, 1); return a[0] || ''; }
  function orderId() {
    db.seq = (db.seq || 0) + 1;
    return 'PKU-' + ymd(today()).replace(/-/g, '') + '-' + String(db.seq).padStart(3, '0');
  }
  function addMsg(to, type, title, body, oid) {
    db.msgs.unshift({ id: 'm' + Date.now() + Math.floor(Math.random() * 100), to, type, title, body, time: Date.now(), read: false, orderId: oid || '' });
  }
  function renderTpl(tpl, data) {
    return String(tpl || '').replace(/\{(\w+)\}/g, (m, k) => data[k] != null ? data[k] : m);
  }
  function addSmsLog(event, toName, toPhone, content) {
    db.settings.sms.logs.unshift({ id: 's' + Date.now() + Math.floor(Math.random() * 100), event, toName, toPhone, content, time: Date.now(), status: 'sent' });
    if (db.settings.sms.logs.length > 30) db.settings.sms.logs.length = 30;
    save();
  }
  function smsForBooking(b) {
    const s = db.settings.sms;
    if (!s.enabled || !s.events.newBooking) return;
    const date = dateCN(b.date), time = SLOTS[b.slot].label + ' ' + SLOTS[b.slot].time;
    s.recipients.forEach(r => {
      addSmsLog('新预约提醒', r.name, r.phone, renderTpl(s.templates.newBooking, { org: b.org, doctor: b.doctorName, date, time, order: b.id }));
    });
  }
  function smsForReply(b) {
    const s = db.settings.sms;
    if (!s.enabled || !s.events.replyToClient) return;
    addSmsLog('方案回复通知', b.contact, b.phone, renderTpl(s.templates.reply, {
      org: b.org, doctor: b.doctorName, topic: '《' + (b.plan ? b.plan.topic : b.topic) + '》', date: dateCN(b.date), order: b.id
    }));
  }

  const state = {
    role: sessionStorage.getItem(ROLE_KEY) === 'admin' ? 'admin' : 'client',
    stack: [],
    filterTier: 'all', filterDept: 'all', q: '',
    expertId: '', selDate: '', selSlot: '',
    bkStep: 0, draft: null, err: null, lastOrder: '',
    myFilter: 'all',
    admFilter: 'all', admQ: '',
    reply: null,
    schedId: '1025',
    loginErr: ''
  };
  state.stack = [state.role === 'admin' ? { v: 'adminHome', p: {} } : { v: 'home', p: {} }];
  history.replaceState({ i: 1 }, '');

  function current() { return state.stack[state.stack.length - 1]; }
  function go(v, p) {
    state.stack.push({ v, p: p || {} });
    history.pushState({ i: state.stack.length }, '');
    render();
  }
  function back() {
    if (state.stack.length > 1) history.back();
    else switchTab(state.role === 'admin' ? 'adminHome' : 'home');
  }
  function switchTab(v) {
    state.stack = [{ v, p: {} }];
    history.replaceState({ i: 1 }, '');
    render();
    window.scrollTo(0, 0);
  }
  window.addEventListener('popstate', function () {
    if (state.stack.length > 1) { state.stack.pop(); render(); }
  });

  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.innerHTML = icon('check') + '<span>' + esc(msg) + '</span>';
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2400);
  }
  function openSheet(html) {
    $('#overlay').innerHTML = '<div class="mask" data-act="close-sheet"><div class="sheet"><div class="bar"></div>' + html + '</div></div>';
  }
  function closeSheet() { $('#overlay').innerHTML = ''; }

  function copyText(text) {
    const done = () => toast('已复制');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请长按选择'); }
      ta.remove();
    }
  }

  const TABS = [
    { v: 'home', label: '首页', ic: 'home' },
    { v: 'experts', label: '专家', ic: 'steth' },
    { v: 'my', label: '预约', ic: 'calendar' },
    { v: 'profile', label: '我的', ic: 'user' }
  ];
  const ADMIN_TABS = [
    { v: 'adminHome', label: '工作台', ic: 'grid' },
    { v: 'adminList', label: '预约管理', ic: 'calendar' },
    { v: 'adminSms', label: '短信提醒', ic: 'msg' }
  ];
  function tabbarHTML(v) {
    if (state.role === 'admin') {
      return ADMIN_TABS.map(t => '<button class="tab ' + (t.v === v ? 'on' : '') + '" data-act="tab" data-tab="' + t.v + '">' + icon(t.ic) + '<span>' + t.label + '</span>' + (t.v === 'adminHome' && unread('admin') ? '<i class="tdot"></i>' : '') + '</button>').join('');
    }
    return TABS.map(t => '<button class="tab ' + (t.v === v ? 'on' : '') + '" data-act="tab" data-tab="' + t.v + '">' + icon(t.ic) + '<span>' + t.label + '</span>' + (t.v === 'profile' && unread('client') ? '<i class="tdot"></i>' : '') + '</button>').join('');
  }

  function priceShort(doc) {
    if (doc.tier === 1) return { main: '¥10万', unit: '/场' };
    if (doc.tier === 2) return { main: '¥2–5万', unit: '/场' };
    return { main: '面议', unit: '' };
  }

  function homePage() {
    const tiers = [1, 2, 3].map(t => {
      const m = D.tiers[t];
      const cnt = t === 1 ? '12 位院士 + 10 位大咖' : t === 2 ? '15 位主任级专家' : '18 位专业医生';
      return '<button class="tier t' + t + '" data-act="tier" data-tier="' + t + '">' +
        '<div class="tl"><span class="tn">' + (t === 1 ? icon('crown') : t === 2 ? icon('steth') : icon('users')) + m.name + '</span><span class="tc">' + cnt + '</span></div>' +
        '<div class="tr"><span class="tf">' + (t === 1 ? '¥10万/场' : t === 2 ? '¥2–5万/场' : '按方案报价') + '</span><span class="tp">' + m.leadLabel + '</span></div>' +
        '</button>';
    }).join('');
    const fmts = D.formats.map(f => '<div class="fmt"><div class="fi">' + icon(f.icon) + '</div><h4>' + f.name + '</h4><p>' + f.desc + '</p></div>').join('');
    const featured = D.doctors.filter(d => d.tier <= 2).slice(0, 6).map(d => {
      const fee = priceShort(d);
      return '<button class="ex-mini" data-act="expert" data-id="' + d.id + '">' +
        '<div class="top">' + avatar(d, 'ava') + '<div style="min-width:0"><h4>' + esc(d.name) + '</h4><div class="sub">' + esc(d.title) + ' · ' + esc(d.dept) + '</div></div></div>' +
        '<div class="tag">' + tierBadge(d.tier, d.group ? '院士顾问团' : '') + '<span class="fee">' + fee.main + '</span></div>' +
        '<div class="line">' + icon('clock') + '最近可约 ' + dateShort(firstAvailable(d)) + '</div>' +
        '</button>';
    }).join('');
    return '<div class="page with-tab">' +
      '<section class="hero">' +
        '<div class="hero-orbit"></div>' +
        '<div class="hero-top"><img class="hero-logo" src="assets/logo-light.png" alt="北大医疗"><button class="hero-entry" data-act="go" data-view="adminLogin">' + icon('lock') + '院方入口</button></div>' +
        '<div class="hero-copy">' +
          '<div class="eyebrow">北大医疗国际医院 · 企业健康服务</div>' +
          '<h1>把院士专家<span>请进企业</span></h1>' +
          '<p>面向保险公司与企业客户的线下专家讲座、健康活动预约平台。三级专家资源，透明预约周期，院方全程对接课题与流程。</p>' +
        '</div>' +
        '<div class="hero-stats">' +
          '<div><b>12<i>位</i></b><span>院士顾问团</span></div>' +
          '<div><b>44<i>位</i></b><span>可约专家</span></div>' +
          '<div><b>7<i>天</i></b><span>最快响应</span></div>' +
        '</div>' +
        '<div class="hero-actions"><button class="btn gold" data-act="tab" data-tab="experts">' + icon('calendar') + '预约专家讲座</button><button class="btn light" data-act="tab" data-tab="experts">查看专家</button></div>' +
        '<div class="hero-foot">' + icon('shield') + '北大医疗集团成员 · 院方直属专家资源</div>' +
      '</section>' +
      '<section class="pyramid-card">' +
        '<div class="pc-head"><h3>三级专家资源</h3><span>按活动规模选择</span></div>' +
        '<div class="pyr">' + tiers + '</div>' +
        '<div class="pyr-note">' + icon('alert') + '院士顾问团为邀约制，具体出席以院方确认为准</div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="sec-head"><h2>一场活动，<em>多种打开方式</em></h2></div>' +
        '<p class="sec-sub">从大型论坛到部门沙龙，按企业场景组合专家、时长与互动形式。</p>' +
        '<div class="fmt-grid">' + fmts + '</div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="sec-head"><h2>院方直属专家</h2><button class="more" data-act="tab" data-tab="experts">全部 44 位 ' + icon('arrow', 'sm') + '</button></div>' +
        '<div class="ex-rail">' + featured + '</div>' +
      '</section>' +
      '<section class="section tight">' +
        '<div class="sec-head"><h2>院方资源</h2></div>' +
        '<div class="campus">' +
          '<img src="assets/hospital-intro.webp" alt="北大医疗国际医院">' +
          '<div class="tags"><span>北大医疗集团成员</span><span>院士顾问团</span></div>' +
          '<div class="ov"><div class="k">PKU HEALTHCARE INTERNATIONAL HOSPITAL</div><h3>北大医疗国际医院</h3><p>汇聚院士顾问、科室主任与专业医生，为保险客户与企业员工提供从科普到咨询的完整健康活动方案。</p></div>' +
        '</div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="sec-head"><h2>从需求到落地，<em>四步完成</em></h2></div>' +
        '<div class="flow">' +
          '<div class="flow-item"><div class="n">01</div><h4>提交活动需求</h4><p>选择专家层级、课题方向与可约时间，填写企业人数与场地信息。</p></div>' +
          '<div class="flow-item"><div class="n">02</div><h4>院方匹配与回复</h4><p>健康管理中心确认讲者排期，回复课题、会议内容、流程与时间安排。</p></div>' +
          '<div class="flow-item"><div class="n">03</div><h4>确认活动方案</h4><p>在预约详情中查看完整方案，一键确认，院方对接人同步跟进。</p></div>' +
          '<div class="flow-item"><div class="n">04</div><h4>活动执行与回访</h4><p>院方团队按流程到场执行，活动后提供内容纪要与企业健康建议。</p></div>' +
        '</div>' +
      '</section>' +
      '<section class="section tight">' +
        '<div class="sec-head"><h2>服务对象</h2></div>' +
        '<div class="chips"><span class="chip">保险公司客户活动</span><span class="chip">企业工会与 HR</span><span class="chip">银行私行客户</span><span class="chip">高净值客户答谢</span></div>' +
      '</section>' +
      '<footer class="footer">' +
        '<img src="assets/logo.png" alt="北大医疗">' +
        '<p>北大医疗国际医院 · 企业健康服务<br>专家资源与排期以院方最终确认为准</p>' +
        '<div class="links"><button data-act="go" data-view="adminLogin">院方工作台</button><button data-act="profileNotice">活动须知</button><button data-act="profileAbout">关于平台</button></div>' +
        '<div class="cp">© 2026 北大医疗国际医院<br>本页面用于专家讲座预约流程展示</div>' +
      '</footer>' +
      '</div>';
  }

  function filteredDoctors() {
    const q = state.q.trim().toLowerCase();
    return D.doctors.filter(d => {
      if (state.filterTier !== 'all' && String(d.tier) !== String(state.filterTier)) return false;
      if (state.filterDept !== 'all' && d.dept !== state.filterDept) return false;
      if (q) {
        const hay = [d.name, d.title, d.dept, d.short, (d.topics || []).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function exCard(d) {
    const fee = priceShort(d);
    const soon = firstAvailable(d);
    if (d.group) {
      return '<div class="ex-card group-card" data-act="expert" data-id="' + d.id + '">' +
        avatar(d, 'ava') +
        '<div class="body">' +
          '<div class="r1"><h3>院士专家顾问团</h3><span class="badge gold">12 位院士</span></div>' +
          '<div class="ti">中国科学院 / 中国工程院 · 多学科</div>' +
          '<div class="sp">韩启德、庄辉、陈香美、詹启敏、乔杰、董尔丹、丁健 等 12 位院士</div>' +
          '<div class="f1"><span class="av">' + icon('clock') + (soon ? '最近可约 ' + dateShort(soon) : '排期中') + '</span><span class="fe">' + fee.main + (fee.unit ? fee.unit : '') + '</span></div>' +
        '</div>' +
      '</div>';
    }
    return '<div class="ex-card" data-act="expert" data-id="' + d.id + '">' +
      avatar(d, 'ava') +
      '<div class="body">' +
        '<div class="r1"><h3>' + esc(d.name) + '</h3>' + tierBadge(d.tier, d.group ? '院士顾问团' : '') + '</div>' +
        '<div class="ti">' + esc(d.title) + ' · ' + esc(d.dept) + '</div>' +
        '<div class="sp">' + esc(d.short) + '</div>' +
        '<div class="f1"><span class="av">' + icon('clock') + (soon ? '最近可约 ' + dateShort(soon) : '排期中') + '</span><span class="fe">' + fee.main + (fee.unit ? fee.unit : '') + '</span></div>' +
      '</div>' +
    '</div>';
  }
  function academicianBanner() {
    return '<button class="ac-banner" data-act="go" data-view="academicians">' +
      '<div class="k">ACADEMICIAN ADVISORY BOARD</div>' +
      '<h3>院士专家顾问团</h3>' +
      '<p>12 位中国科学院、中国工程院院士，覆盖基础医学、临床医学、药学与公共卫生。</p>' +
      '<div class="ac-names">' + D.academicians.slice(0, 5).map(a => '<span>' + a.name + '</span>').join('') + '<span>等 12 位</span></div>' +
      '<span class="go">' + icon('arrow') + '</span>' +
    '</button>';
  }
  function exListInner() {
    const list = filteredDoctors();
    const cards = list.map(exCard).join('');
    return cards ? '<div class="list">' + cards + '</div>' : '<div class="ex-list-empty">没有符合条件的专家<br>试试其他科室或关键词</div>';
  }
  function expertListPage() {
    const depts = [];
    D.doctors.forEach(d => { if (depts.indexOf(d.dept) < 0) depts.push(d.dept); });
    const seg = [['all', '全部', D.doctors.length], ['1', '院士 · 大咖', 11], ['2', '专家咨询', 15], ['3', '专业医生', 18]].map(s => '<button class="' + (state.filterTier === s[0] ? 'on' : '') + '" data-act="filter-tier" data-tier="' + s[0] + '">' + s[1] + '<span class="n">' + s[2] + '</span></button>').join('');
    const deptChips = ['all'].concat(depts).map(dp => '<button class="' + (state.filterDept === dp ? 'on' : '') + '" data-act="filter-dept" data-dept="' + esc(dp) + '">' + (dp === 'all' ? '全部科室' : esc(dp)) + '</button>').join('');
    const n = filteredDoctors().length;
    return '<div class="page with-tab">' +
      '<div class="topbar"><div class="tt"><h1>专家资源</h1><span>按活动规模与科室筛选</span></div><button class="act" data-act="go" data-view="messages">' + icon('bell') + (unread('client') ? '<i class="dot"></i>' : '') + '</button></div>' +
      '<div class="searchbar">' + icon('search') + '<input id="exSearch" value="' + esc(state.q) + '" placeholder="搜索专家、科室或课题方向"><button class="clr ' + (state.q ? '' : 'hide') + '" data-act="clear-search">' + icon('close') + '</button></div>' +
      '<div class="seg">' + seg + '</div>' +
      '<div class="deptbar">' + deptChips + '</div>' +
      '<div class="result-line"><span>共 <b id="exCount">' + n + '</b> 位专家</span><span>按可约时间排序</span></div>' +
      '<div id="exList">' + exListInner() + '</div>' +
      '</div>';
  }

  function academiciansPage() {
    const rows = D.academicians.map(a => '<div class="ac-row"><div class="av">' + a.name.slice(0, 1) + '</div><div class="nm"><b>' + a.name + '</b><span>' + a.academy + ' · ' + a.field + '</span></div><span class="tag">' + a.role + '</span></div>').join('');
    return '<div class="page fixed-cta">' +
      '<div class="exhero" style="padding-bottom:22px">' +
        '<div class="nav"><button data-act="back">' + icon('back') + '</button><button data-act="sharePage">' + icon('share') + '</button></div>' +
        '<div style="position:relative;z-index:2;margin-top:20px"><div class="eyebrow">ACADEMICIAN ADVISORY BOARD</div><h1 style="margin:8px 0 0;font-family:var(--serif);font-size:25px;font-weight:500">院士专家顾问团</h1><p style="margin:8px 0 0;font-size:11px;line-height:1.75;color:rgba(255,255,255,.66)">北大医疗集团院士专家顾问团首批 12 位院士，涵盖基础医学、临床医学、药学与公共卫生领域，为大型企业及保险客户提供战略级健康主题分享。</p></div>' +
      '</div>' +
      '<div class="detail-body">' +
        '<div class="dcard"><h3>' + icon('crown') + '首批院士成员</h3><div class="ac-list">' + rows + '</div><div class="ac-more">另有 5 位院士按活动主题与档期邀约确认</div></div>' +
        '<div class="dcard"><h3>' + icon('talk') + '可邀约方向</h3><div class="topic-chips"><span>健康中国与企业健康战略</span><span>重大疾病防治前沿</span><span>医学科技创新</span><span>院士面对面 · 管理层私享会</span></div><div class="q">' + icon('alert') + '<span>院士顾问团为邀约制资源，需提前 30 天提交需求，具体出席以院方确认为准。</span></div></div>' +
      '</div>' +
      '<div class="bottom-bar"><div class="price"><em>参考费用</em><b>¥10万<small>/场</small></b></div><button class="btn gold" data-act="expert" data-id="academicians">预约院士顾问团 ' + icon('arrow', 'sm') + '</button></div>' +
      '</div>';
  }

  function expertPage(p) {
    const doc = findDoc(p.id) || D.doctors[0];
    if (state.expertId !== doc.id) {
      state.expertId = doc.id;
      state.selDate = availableDates(doc, 10)[0] || '';
      state.selSlot = '';
    }
    const dates = availableDates(doc, 10);
    if (state.selDate && dates.indexOf(state.selDate) < 0) { state.selDate = dates[0] || ''; state.selSlot = ''; }
    const open = {};
    if (state.selDate) openSlots(doc, state.selDate).forEach(s => open[s.key] = true);
    const dateChips = dates.map(ds => { const d = parseYmd(ds); return '<button class="date-chip ' + (state.selDate === ds ? 'on' : '') + '" data-act="set-date" data-date="' + ds + '"><b>' + dateShort(ds) + '</b><span>' + WEEK[d.getDay()] + '</span></button>'; }).join('');
    const slots = ['am', 'pm', 'eve'].map(k => {
      const s = SLOTS[k];
      const full = !open[k];
      return '<button class="slot ' + (full ? 'full' : '') + ' ' + (state.selSlot === k && !full ? 'on' : '') + '" ' + (full ? 'disabled' : '') + ' data-act="set-slot" data-slot="' + k + '">' +
        '<span class="si">' + icon('clock') + '</span><span class="st"><b>' + s.label + '</b><span>' + s.time + '</span></span><span class="ss ' + (full ? 'full' : '') + '">' + (full ? '不可约' : '可预约') + '</span></button>';
    }).join('');
    const groupBlock = doc.group ? '<div class="dcard"><h3>' + icon('crown') + '顾问团成员<button data-act="go" data-view="academicians" style="margin-left:auto;font-size:9.5px;color:var(--brand);font-weight:400">完整名单 ' + icon('arrow', 'sm') + '</button></h3><div class="ac-list">' + D.academicians.map(a => '<div class="ac-row"><div class="av">' + a.name.slice(0, 1) + '</div><div class="nm"><b>' + a.name + '</b><span>' + a.academy + ' · ' + a.field + '</span></div></div>').join('') + '</div><div class="ac-more">另有 5 位院士按活动主题与档期确认</div></div>' : '';
    const selSlot = state.selSlot && open[state.selSlot];
    const price = priceShort(doc);
    return '<div class="page fixed-cta">' +
      '<div class="exhero">' +
        '<div class="nav"><button data-act="back">' + icon('back') + '</button><div class="rbtns"><button data-act="sharePage">' + icon('share') + '</button></div></div>' +
        '<div class="profile">' + avatar(doc, 'bigava') + '<div class="meta"><div class="badges">' + tierBadge(doc.tier, doc.group ? '院士顾问团' : '') + '<span class="badge gold">' + doc.leadLabel + '</span></div><h1>' + esc(doc.name) + '</h1><p class="ti">' + esc(doc.title) + (doc.group ? '' : ' · ' + esc(doc.dept)) + '</p><div class="dept">' + icon('pin') + (doc.group ? '北大医疗集团 · 院士专家顾问团' : '北大医疗国际医院 · ' + esc(doc.dept)) + '</div></div></div>' +
        '<div class="facts"><div><b>' + doc.fee.replace(' / 场', '') + '</b><span>参考费用 / 场</span></div><div><b>' + (doc.group ? '邀约制' : '院方直属') + '</b><span>专家资源</span></div><div><b>' + (doc.group ? '多学科' : doc.dept) + '</b><span>所属科室</span></div></div>' +
      '</div>' +
      '<div class="detail-body">' +
        '<div class="dcard"><h3>' + icon('doc') + '专家擅长</h3><div class="rich">' + esc(doc.specialty) + '</div></div>' +
        groupBlock +
        '<div class="dcard"><h3>' + icon('sparkle') + '推荐课题</h3><div class="topic-chips">' + doc.topics.map(t => '<span>' + esc(t) + '</span>').join('') + '</div><div class="q">' + icon('alert') + '<span>课题可按企业人群与活动目标调整，最终以院方回复方案为准。</span></div></div>' +
        '<div class="dcard"><h3>' + icon('calendar') + '可预约时间</h3><p style="font-size:10.5px;color:var(--muted);line-height:1.6;margin:-3px 0 10px">' + doc.leadLabel + '，以下为院方初步开放的时段。</p>' +
          (dates.length ? '<div class="date-strip">' + dateChips + '</div><div class="slot-grid">' + slots + '</div>' : '<div class="date-empty">该专家近期排期已满，请联系院方协调</div>') +
        '</div>' +
        '<div class="dcard"><h3>' + icon('talk') + '适用活动形式</h3><div class="topic-chips">' + doc.formats.map(f => '<span>' + f + '</span>').join('') + '</div></div>' +
      '</div>' +
      '<div class="bottom-bar"><div class="price"><em>参考费用</em><b>' + price.main + (price.unit ? '<small>' + price.unit + '</small>' : '') + '</b></div><button class="btn gold" data-act="start-booking" data-id="' + doc.id + '" ' + (selSlot ? '' : 'disabled') + '>' + (selSlot ? '预约该专家' : '请选择时间') + ' ' + icon('arrow', 'sm') + '</button></div>' +
      '</div>';
  }

  function fErr(f) { return state.err && state.err.f === f ? 'err' : ''; }
  function fMsg(f) { return state.err && state.err.f === f ? '<div class="errmsg">' + esc(state.err.msg) + '</div>' : ''; }

  function bookingPage() {
    const d = state.draft || {};
    const doc = findDoc(d.doctorId) || D.doctors[0];
    const step = state.bkStep;
    const steps = [1, 2, 3].map((n, i) => {
      const cls = i === step ? 'on' : i < step ? 'done' : '';
      return '<div class="step ' + cls + '"><div class="c">' + (i < step ? icon('check', 'sm') : n) + '</div><span>' + ['活动信息', '联系人', '确认提交'][i] + '</span></div>';
    }).join('<div class="step-line"></div>');
    const head = '<div class="bk-head">' +
      '<div class="bk-expert">' + avatar(doc, 'ava') + '<div class="nm"><b>' + esc(doc.name) + '</b><span>' + esc(doc.title) + ' · ' + esc(doc.dept) + '</span></div><button class="edit" data-act="go" data-view="expert" data-id="' + doc.id + '">' + icon('edit', 'sm') + '修改</button></div>' +
      '<div class="bk-when"><div><em>活动日期</em><b>' + (d.date ? dateCN(d.date) : '待选择') + '</b></div><div><em>时段</em><b>' + (d.slot ? SLOTS[d.slot].label + ' ' + SLOTS[d.slot].time : '待选择') + '</b></div><div><em>状态</em><b class="g">时段已锁定</b></div></div>' +
    '</div>';
    let body = '';
    if (step === 0) {
      const ctypes = [['保险公司', 'shield'], ['企业', 'building'], ['其他机构', 'briefcase']].map(c => '<button class="opt ' + (d.clientType === c[0] ? 'on' : '') + '" data-act="set-draft" data-field="clientType" data-value="' + c[0] + '">' + icon(c[1]) + '<b>' + c[0] + '</b></button>').join('');
      const fmts = D.formats.map(f => '<button class="opt ' + (d.format === f.name ? 'on' : '') + '" data-act="set-draft" data-field="format" data-value="' + f.name + '"><b>' + f.name + '</b><span>' + f.desc + '</span></button>').join('');
      const cities = D.cities.map(c => '<button class="chip ' + (d.city === c ? 'on' : '') + '" data-act="set-draft" data-field="city" data-value="' + esc(c) + '">' + esc(c) + '</button>').join('');
      const topics = doc.topics.map(t => '<button class="chip ' + (d.topic === t ? 'on' : '') + '" data-act="set-draft" data-field="topic" data-value="' + esc(t) + '">' + esc(t) + '</button>').join('');
      body = '<div class="bk-body">' +
        '<div class="fgroup ' + fErr('clientType') + '"><div class="fl"><label>机构类型<i>*</i></label></div><div class="opt-grid three">' + ctypes + '</div>' + fMsg('clientType') + '</div>' +
        '<div class="fgroup ' + fErr('org') + '"><div class="fl"><label>单位名称<i>*</i></label></div><input data-model="org" value="' + esc(d.org) + '" placeholder="如：中国平安产险北京分公司">' + fMsg('org') + '</div>' +
        '<div class="fgroup ' + fErr('format') + '"><div class="fl"><label>活动形式<i>*</i></label></div><div class="opt-grid">' + fmts + '</div>' + fMsg('format') + '</div>' +
        '<div class="fgroup ' + fErr('city') + '"><div class="fl"><label>活动城市<i>*</i></label><span class="hint">院方差旅另计</span></div><div class="chips">' + cities + '</div>' + fMsg('city') + '</div>' +
        '<div class="fgroup ' + fErr('address') + '"><div class="fl"><label>详细地址<i>*</i></label><span class="hint">用于院方评估到场安排</span></div><input data-model="address" value="' + esc(d.address) + '" placeholder="写字楼、园区或酒店会议场地">' + fMsg('address') + '</div>' +
        '<div class="fgroup ' + fErr('people') + '"><div class="fl"><label>预计人数<i>*</i></label></div><div class="stepper-row"><div class="stepper"><button data-act="people" data-delta="-10">−</button><input data-model="people" type="number" inputmode="numeric" value="' + (d.people || 100) + '"><button data-act="people" data-delta="10">+</button></div><span class="tip">建议 50–300 人<br>超过 300 人请备注</span></div>' + fMsg('people') + '</div>' +
        '<div class="fgroup ' + fErr('topic') + '"><div class="fl"><label>期望课题<i>*</i></label><span class="hint">可多沟通后调整</span></div><div class="chips">' + topics + '<button class="chip ' + (doc.topics.indexOf(d.topic) < 0 ? 'on' : '') + '" data-act="set-draft" data-field="topic" data-value="其他方向">其他方向</button></div>' + fMsg('topic') + '</div>' +
        '<div class="fgroup"><div class="fl"><label>活动背景与补充说明</label><span class="hint">选填</span></div><textarea data-model="note" placeholder="人群特点、希望重点讲解的内容、场地设备等">' + esc(d.note) + '</textarea></div>' +
      '</div>';
    } else if (step === 1) {
      body = '<div class="bk-body">' +
        '<div class="fgroup ' + fErr('contact') + '"><div class="fl"><label>联系人姓名<i>*</i></label></div><input data-model="contact" value="' + esc(d.contact) + '" placeholder="请填写活动对接人">' + fMsg('contact') + '</div>' +
        '<div class="fgroup ' + fErr('phone') + '"><div class="fl"><label>手机号<i>*</i></label><span class="hint">用于接收院方短信通知</span></div><input data-model="phone" type="tel" inputmode="numeric" maxlength="11" value="' + esc(d.phone) + '" placeholder="11 位手机号">' + fMsg('phone') + '</div>' +
        '<div class="fgroup ' + fErr('email') + '"><div class="fl"><label>邮箱</label><span class="hint">选填，用于接收方案</span></div><input data-model="email" type="email" value="' + esc(d.email) + '" placeholder="name@company.com">' + fMsg('email') + '</div>' +
        '<div class="fgroup"><div class="fl"><label>联系偏好</label></div><label class="checkline" style="margin-top:0"><input type="checkbox" data-model="needCall" ' + (d.needCall ? 'checked' : '') + '>希望院方在回复方案前电话沟通活动细节</label></div>' +
        '<div class="notice">' + icon('shield') + '<span>您的联系方式仅用于本次活动的院方对接与短信提醒，不会用于其他用途。</span></div>' +
      '</div>';
    } else {
      const price = priceShort(doc);
      const feeText = doc.tier === 1 ? '¥100,000 / 场' : doc.tier === 2 ? '¥20,000–50,000 / 场' : '按活动方案报价';
      body = '<div class="bk-body">' +
        '<div class="summary">' +
          '<div class="sum-row"><span class="k">预约主体</span><span class="v">' + esc(d.org) + ' · ' + esc(d.clientType) + '</span></div>' +
          '<div class="sum-row"><span class="k">活动形式</span><span class="v">' + esc(d.format) + '</span></div>' +
          '<div class="sum-row"><span class="k">专家</span><span class="v">' + esc(doc.name) + ' · ' + esc(doc.dept) + '</span></div>' +
          '<div class="sum-row"><span class="k">活动时间</span><span class="v">' + (d.date ? dateCN(d.date) + ' ' + SLOTS[d.slot].label + ' ' + SLOTS[d.slot].time : '') + '</span></div>' +
          '<div class="sum-row"><span class="k">活动地点</span><span class="v">' + esc(d.city) + ' · ' + esc(d.address) + '</span></div>' +
          '<div class="sum-row"><span class="k">预计人数</span><span class="v">' + (d.people || 0) + ' 人</span></div>' +
          '<div class="sum-row"><span class="k">期望课题</span><span class="v">' + esc(d.topic) + '</span></div>' +
          '<div class="sum-row"><span class="k">联系人</span><span class="v">' + esc(d.contact) + ' · ' + esc(d.phone) + '</span></div>' +
        '</div>' +
        '<div class="fee-box"><div class="fr"><span>参考费用</span><b>' + (doc.tier === 3 ? '按方案报价' : feeText) + '</b></div><p>费用为专家课酬参考，差旅、场地与物料另计；最终以院方回复的正式方案为准。</p></div>' +
        '<div class="notice">' + icon('alert') + '<span>提交后系统将短信提醒院方对接人，院方通常在 1 个工作日内回复课题、会议内容、流程与时间安排。</span></div>' +
        '<label class="checkline"><input type="checkbox" data-model="agree" ' + (d.agree ? 'checked' : '') + '>我已阅读并同意《专家讲座预约服务说明》，确认以上活动信息真实有效。' + (state.err && state.err.f === 'agree' ? '<span style="color:#B23B3B;display:block;margin-top:4px">' + esc(state.err.msg) + '</span>' : '') + '</label>' +
      '</div>';
    }
    const price = priceShort(doc);
    const btnText = step < 2 ? '下一步' : '提交预约';
    return '<div class="page fixed-cta-lg">' +
      '<div class="topbar"><button class="back" data-act="bk-back">' + icon('back') + '</button><div class="tt"><h1>预约专家讲座</h1><span>第 ' + (step + 1) + ' / 3 步</span></div></div>' +
      head +
      '<div class="steps">' + steps + '</div>' +
      body +
      '<div class="bottom-bar"><div class="price"><em>参考费用</em><b>' + price.main + (price.unit ? '<small>' + price.unit + '</small>' : '') + '</b></div><button class="btn gold" data-act="bk-next">' + btnText + ' ' + icon('arrow', 'sm') + '</button></div>' +
    '</div>';
  }

  function successPage(p) {
    const b = findBooking(p.id) || db.bookings[0];
    if (!b) return homePage();
    const host = (db.settings.sms.recipients[0] || { name: '院方对接人', phone: '' });
    return '<div class="page plain success">' +
      '<div class="check">' + icon('check') + '</div>' +
      '<h1>预约已提交</h1>' +
      '<p class="sub">院方已收到您的活动需求<br>正在匹配讲者与课题，请留意短信通知</p>' +
      '<div class="order-card">' +
        '<div class="order-top"><div class="id">预约单号<b>' + b.id + '</b></div><button class="copy" data-act="copy-order" data-order="' + b.id + '">' + icon('copy') + '复制</button></div>' +
        '<div class="success-rows">' +
          '<div class="r"><span>预约主体</span><b>' + esc(b.org) + '</b></div>' +
          '<div class="r"><span>专家</span><b>' + esc(b.doctorName) + ' · ' + esc(b.doctorDept) + '</b></div>' +
          '<div class="r"><span>活动时间</span><b>' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + '</b></div>' +
          '<div class="r"><span>活动形式</span><b>' + esc(b.format) + ' · ' + b.people + ' 人</b></div>' +
        '</div>' +
        '<div class="sms-note">' + icon('check') + '<span>已短信提醒院方对接人 ' + esc(host.name) + '（' + maskPhone(host.phone) + '）<br>院方将回复课题、会议内容、流程与时间安排</span></div>' +
      '</div>' +
      '<div class="success-actions"><button class="btn gold" data-act="go" data-view="booking" data-id="' + b.id + '">查看预约详情 ' + icon('arrow', 'sm') + '</button><button class="btn ghost" data-act="tab" data-tab="home">返回首页</button></div>' +
      '<div class="tip">如需调整活动时间或补充信息，可在预约详情中联系院方对接人</div>' +
    '</div>';
  }

  function myPage() {
    const list = db.bookings.filter(b => state.myFilter === 'all' || b.status === state.myFilter);
    const count = s => db.bookings.filter(b => b.status === s).length;
    const filters = [['all', '全部'], ['pending', '待回复'], ['replied', '已回复'], ['confirmed', '已确认']].map(f => '<button class="' + (state.myFilter === f[0] ? 'on' : '') + '" data-act="my-filter" data-f="' + f[0] + '">' + f[1] + (f[0] !== 'all' ? ' ' + count(f[0]) : '') + '</button>').join('');
    const cards = list.map(b => {
      const doc = findDoc(b.doctorId) || { name: b.doctorName, photo: b.doctorPhoto };
      return '<div class="bk-card ' + b.status + '" data-act="go" data-view="booking" data-id="' + b.id + '">' +
        '<div class="r1">' + statusPill(b.status) + '<span class="st">' + timeAgo(b.createdAt) + '提交</span></div>' +
        '<h3>' + esc(b.org) + '</h3>' +
        '<div class="r2">' + avatar(doc, 'ava') + '<div class="nm"><b>' + esc(b.doctorName) + ' · ' + esc(b.doctorDept) + '</b><span>' + esc(b.format) + ' · ' + b.people + ' 人</span></div><div class="dt"><b>' + dateShort(b.date) + '</b>' + SLOTS[b.slot].label + '</div></div>' +
        '<div class="r3"><span class="id">' + b.id + '</span><span class="go">' + (b.status === 'replied' ? '查看方案 ' : '查看详情 ') + icon('arrow', 'sm') + '</span></div>' +
      '</div>';
    }).join('');
    return '<div class="page with-tab">' +
      '<div class="my-hero"><div class="top"><div class="who"><div class="av">企</div><div><b>企业客户</b><span>北大医疗国际医院 · 专家讲座服务</span></div></div><button class="bell" data-act="go" data-view="messages">' + icon('bell') + (unread('client') ? '<i class="dot"></i>' : '') + '</button></div>' +
        '<div class="my-stats"><div class="g"><b>' + count('pending') + '</b><span>待院方回复</span></div><div><b>' + count('replied') + '</b><span>已回复方案</span></div><div><b>' + count('confirmed') + '</b><span>已确认活动</span></div></div>' +
      '</div>' +
      '<div class="my-tools"><button class="my-tool" data-act="go" data-view="messages"><span class="ti">' + icon('msg') + '</span><div><b>消息中心</b><span>' + (unread('client') ? unread('client') + ' 条未读' : '暂无未读') + '</span></div><span class="arr">' + icon('arrow', 'sm') + '</span></button><a class="my-tool" href="tel:13800138000"><span class="ti">' + icon('phone') + '</span><div><b>联系院方</b><span>专属对接人</span></div><span class="arr">' + icon('arrow', 'sm') + '</span></a></div>' +
      '<div class="filters">' + filters + '</div>' +
      (cards ? '<div class="bk-list">' + cards + '</div>' : '<div class="bk-empty"><div class="eic">' + icon('calendar') + '</div><h3>暂无' + (state.myFilter === 'all' ? '' : STATUS[state.myFilter].label) + '预约</h3><p>选择专家与可约时段，提交入企活动需求</p><button class="btn navy" data-act="tab" data-tab="experts">去预约专家</button></div>') +
      '</div>';
  }

  function orderTimeline(b) {
    if (b.status === 'cancelled') {
      return '<div class="tl"><div class="tl-row done"><i class="dot"></i><b>预约已提交</b><span>' + timeAgo(b.createdAt) + '</span></div><div class="tl-row now"><i class="dot"></i><b>预约已取消</b><span>' + (b.cancelledAt ? timeAgo(b.cancelledAt) : '') + ' · 时段已释放</span></div></div>';
    }
    const replied = b.status === 'replied' || b.status === 'confirmed';
    const confirmed = b.status === 'confirmed';
    return '<div class="tl">' +
      '<div class="tl-row done"><i class="dot"></i><b>预约已提交</b><span>' + timeAgo(b.createdAt) + ' · 已短信提醒院方</span></div>' +
      '<div class="tl-row ' + (replied ? 'done' : 'now') + '"><i class="dot"></i><b>院方回复方案</b><span>' + (replied ? '已回复课题、流程与时间安排' : '院方正在准备方案，通常 1 个工作日内回复') + '</span></div>' +
      '<div class="tl-row ' + (confirmed ? 'done' : '') + '"><i class="dot"></i><b>客户确认方案</b><span>' + (confirmed ? '已确认，院方将提前联系' : '查看方案后确认') + '</span></div>' +
      '<div class="tl-row"><i class="dot"></i><b>活动执行</b><span>' + dateCN(b.date) + ' ' + SLOTS[b.slot].time + '</span></div>' +
    '</div>';
  }

  function planHTML(b) {
    if (!b.plan) return '';
    const p = b.plan;
    return '<div class="plan-card">' +
      '<div class="plan-head"><div class="l"><b>' + icon('doc') + '院方回复方案</b><span>' + (p.sentAt ? timeAgo(p.sentAt) + '回复' : '院方已回复') + '</span></div><span class="st">OFFICIAL</span></div>' +
      '<div class="plan-body">' +
        '<div class="plan-label">活动课题</div><div class="plan-topic">《' + esc(p.topic) + '》</div>' +
        '<div style="margin-top:14px"><div class="plan-label">会议内容</div><div class="plan-text">' + esc(p.outline) + '</div></div>' +
        '<div class="agenda"><div class="plan-label">活动流程</div>' + (p.agenda || []).map(a => '<div class="agenda-row"><span class="t">' + esc(a.time) + '</span><span class="it">' + esc(a.item) + '</span><span class="ow">' + esc(a.owner) + '</span></div>').join('') + '</div>' +
        '<div class="when-box"><div><em>活动日期</em><b>' + dateCN(p.date) + '</b></div><div><em>开始时间</em><b>' + esc(p.start) + '</b></div><div><em>预计时长</em><b>' + esc(p.duration) + '</b></div></div>' +
        '<div class="host-card"><div class="av">' + (p.host || '院').slice(0, 1) + '</div><div class="nm"><b>院方对接人 · ' + esc(p.host) + '</b><span>' + maskPhone(p.hostPhone) + ' · 活动统筹与现场对接</span></div><a class="call" href="tel:' + esc(p.hostPhone) + '">' + icon('phone') + '</a></div>' +
        (p.note ? '<div class="plan-note">' + esc(p.note) + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  function bookingPageDetail(p) {
    const b = findBooking(p.id) || db.bookings[0];
    if (!b) return myPage();
    const doc = findDoc(b.doctorId) || { name: b.doctorName, title: b.doctorTitle, dept: b.doctorDept, photo: b.doctorPhoto, tier: b.doctorTier };
    const st = STATUS[b.status];
    return '<div class="page fixed-cta">' +
      '<div class="bdetail-status"><div class="top"><button data-act="back">' + icon('back') + '</button><button data-act="copy-order" data-order="' + b.id + '">' + icon('copy') + '</button></div>' +
        '<div class="hex">' + st.hero + '</div><div class="sub">' + st.sub + '</div><div class="oid">' + b.id + ' · ' + timeAgo(b.createdAt) + '提交</div>' +
      '</div>' +
      '<div class="bdetail-body">' +
        '<div class="bdetail-card"><div class="h"><b>' + icon('clock') + '预约进度</b>' + statusPill(b.status) + '</div>' + orderTimeline(b) + '</div>' +
        '<div class="bdetail-card"><div class="h"><b>' + icon('steth') + '活动专家</b><span>' + (b.doctorTier === 1 ? '院士 · 大咖' : b.doctorTier === 2 ? '专家咨询' : '专业医生') + '</span></div>' +
          '<div class="expert-line">' + avatar(doc, 'ava') + '<div class="nm"><b>' + esc(b.doctorName) + '</b><span>' + esc(b.doctorTitle || '') + ' · ' + esc(b.doctorDept) + '</span></div><button class="go" data-act="expert" data-id="' + b.doctorId + '">专家详情 ' + icon('arrow', 'sm') + '</button></div>' +
        '</div>' +
        '<div class="bdetail-card"><div class="h"><b>' + icon('briefcase') + '活动信息</b></div>' +
          '<div class="kv"><span class="k">预约主体</span><span class="v">' + esc(b.org) + ' · ' + esc(b.clientType) + '</span></div>' +
          '<div class="kv"><span class="k">活动形式</span><span class="v">' + esc(b.format) + ' · ' + b.people + ' 人</span></div>' +
          '<div class="kv"><span class="k">活动时间</span><span class="v gold">' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + ' ' + SLOTS[b.slot].time + '</span></div>' +
          '<div class="kv"><span class="k">活动地点</span><span class="v">' + esc(b.city) + ' · ' + esc(b.address) + '</span></div>' +
          '<div class="kv"><span class="k">期望课题</span><span class="v">' + esc(b.topic) + '</span></div>' +
          (b.note ? '<div class="kv"><span class="k">补充说明</span><span class="v">' + esc(b.note) + '</span></div>' : '') +
          '<div class="kv"><span class="k">联系人</span><span class="v">' + esc(b.contact) + ' · ' + maskPhone(b.phone) + '</span></div>' +
        '</div>' +
        (b.plan ? planHTML(b) : (b.status === 'pending' ? '<div class="pending-plan"><div class="pico">' + icon('clock') + '</div><h3>院方正在准备活动方案</h3><p>已短信提醒院方对接人，通常 1 个工作日内回复<br>课题、会议内容、活动流程与时间安排</p></div>' : '')) +
        (b.plan && b.status === 'replied' ? '<div class="plan-actions"><button class="btn gold" data-act="confirm-plan" data-id="' + b.id + '">' + icon('check', 'sm') + '确认方案</button><a class="btn ghost" href="tel:' + esc(b.plan.hostPhone) + '">' + icon('phone', 'sm') + '联系对接人</a></div>' : '') +
        (b.status === 'replied' ? '<div class="notice" style="margin:0 0 10px">' + icon('alert') + '<span>确认后方案即锁定，如需调整时间或内容，请先联系院方对接人。</span></div>' : '') +
        ((b.status === 'pending' || b.status === 'replied') ? '<div class="detail-foot"><button class="cancel-link" data-act="cancel-booking" data-id="' + b.id + '">取消本次预约</button></div>' : '') +
      '</div>' +
      ((b.status === 'pending' || b.status === 'replied') ? '<div class="bottom-bar"><div class="price"><em>当前状态</em><b style="font-size:13px">' + st.label + '</b></div><a class="btn navy" href="tel:' + (b.plan ? esc(b.plan.hostPhone) : '13800138000') + '">' + icon('phone', 'sm') + '联系院方</a></div>' : '') +
    '</div>';
  }

  function messagesPage() {
    const to = state.role === 'admin' ? 'admin' : 'client';
    const list = db.msgs.filter(m => m.to === to);
    const rows = list.map(m => {
      const cls = m.type === 'reply' ? '' : m.type === 'confirm' ? 'green' : m.type === 'system' ? 'gold' : '';
      const ic = m.type === 'reply' ? 'doc' : m.type === 'confirm' ? 'check' : m.type === 'sms' ? 'msg' : 'bell';
      return '<div class="msg ' + (m.read ? '' : 'unread') + '" data-act="open-msg" data-id="' + m.id + '">' +
        '<div class="mi ' + cls + '">' + icon(ic) + '</div>' +
        '<div class="mb"><div class="r1"><b>' + esc(m.title) + '</b>' + (m.read ? '' : '<i class="dot"></i>') + '<span class="tm">' + timeAgo(m.time) + '</span></div><p>' + esc(m.body) + '</p>' + (m.orderId ? '<div class="link">查看预约详情 ' + icon('arrow', 'sm') + '</div>' : '') + '</div>' +
      '</div>';
    }).join('');
    return '<div class="page plain">' +
      '<div class="topbar"><button class="back" data-act="back">' + icon('back') + '</button><div class="tt"><h1>' + (to === 'admin' ? '院方消息' : '消息中心') + '</h1><span>' + (unread(to) ? unread(to) + ' 条未读' : '全部已读') + '</span></div><button class="act" data-act="read-all">' + icon('check') + '</button></div>' +
      (rows ? '<div class="msg-list">' + rows + '</div>' : '<div class="msg-empty">暂无消息</div>') +
    '</div>';
  }

  function profilePage() {
    const last = db.bookings[0];
    const org = last ? last.org : '企业客户';
    return '<div class="page with-tab">' +
      '<div class="my-hero"><div class="top"><div class="who"><div class="av">企</div><div><b>' + esc(org) + '</b><span>' + (last ? esc(last.contact) + ' · 活动对接人' : '专家讲座服务客户') + '</span></div></div><button class="bell" data-act="go" data-view="messages">' + icon('bell') + (unread('client') ? '<i class="dot"></i>' : '') + '</button></div>' +
        '<div class="my-stats"><div><b>' + db.bookings.length + '</b><span>累计预约</span></div><div class="g"><b>' + db.bookings.filter(b => b.status === 'confirmed').length + '</b><span>已确认活动</span></div><div><b>44</b><span>可约专家</span></div></div>' +
      '</div>' +
      '<div class="section tight"><div class="menu">' +
        '<button class="menu-row" data-act="go" data-view="messages"><span class="mi">' + icon('msg') + '</span><span class="mt"><b>消息中心</b><span>院方回复、确认与提醒</span></span>' + (unread('client') ? '<i class="badge2">' + unread('client') + '</i>' : '') + '<span class="arr">' + icon('arrow', 'sm') + '</span></button>' +
        '<button class="menu-row" data-act="profileNotice"><span class="mi">' + icon('shield') + '</span><span class="mt"><b>活动须知</b><span>预约、改期与现场执行说明</span></span><span class="arr">' + icon('arrow', 'sm') + '</span></button>' +
        '<a class="menu-row" href="tel:13800138000"><span class="mi">' + icon('phone') + '</span><span class="mt"><b>联系院方</b><span>健康管理中心 · 张老师</span></span><span class="arr">' + icon('arrow', 'sm') + '</span></a>' +
        '<button class="menu-row" data-act="profileAbout"><span class="mi">' + icon('building') + '</span><span class="mt"><b>关于平台</b><span>北大医疗国际医院专家资源</span></span><span class="arr">' + icon('arrow', 'sm') + '</span></button>' +
        '<button class="menu-row" data-act="go" data-view="adminLogin"><span class="mi">' + icon('lock') + '</span><span class="mt"><b>院方工作台</b><span>北大医疗国际医院内部入口</span></span><span class="arr">' + icon('arrow', 'sm') + '</span></button>' +
      '</div>' +
      '<div class="add-note">北大医疗国际医院 · 企业健康服务<br>专家资源与排期以院方最终确认为准</div></div>' +
    '</div>';
  }

  function adminLoginPage() {
    return '<div class="login">' +
      '<div class="lg"><img class="logo" src="assets/logo-light.png" alt="北大医疗"><div class="eyebrow">PKU HEALTHCARE INTERNATIONAL HOSPITAL</div><h1>院方<span>工作台</span></h1><p>北大医疗国际医院 · 健康管理中心<br>处理入企活动预约、回复方案与短信提醒</p></div>' +
      '<div class="login-card"><h3>登录院方工作台</h3><div class="tip">请使用健康管理中心分配的工号登录</div>' +
        '<div class="field"><label>工号</label><input id="aUser" value="PKU-HMC-001" autocomplete="username"></div>' +
        '<div class="field"><label>密码</label><input id="aPass" type="password" value="123456" autocomplete="current-password"></div>' +
        '<button class="btn navy" data-act="admin-login">' + icon('lock', 'sm') + '登录工作台</button>' +
        '<div class="demo">体验账号已填入：PKU-HMC-001 / 123456</div>' +
      '</div>' +
      '<button class="login-back" data-act="exit-admin">' + icon('back', 'sm') + '返回客户端</button>' +
      '<div class="note">本页面用于院方内部预约管理<br>数据保存在本机浏览器</div>' +
    '</div>';
  }

  function adminHomePage() {
    const pending = db.bookings.filter(b => b.status === 'pending');
    const replied = db.bookings.filter(b => b.status === 'replied');
    const confirmed = db.bookings.filter(b => b.status === 'confirmed');
    const todo = pending.concat(replied).slice(0, 2).map(b => '<div class="todo-card" style="margin-bottom:8px"><div class="todo-top"><span class="st">' + (b.status === 'pending' ? '待回复' : '待客户确认') + '</span><span class="tm">' + timeAgo(b.createdAt) + '</span></div><h3>' + esc(b.org) + '</h3><div class="meta">' + esc(b.doctorName) + ' · ' + esc(b.format) + ' · ' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + '</div><div class="r"><span class="who">' + b.people + ' 人 · ' + esc(b.contact) + '</span><button class="btn ' + (b.status === 'pending' ? 'gold' : 'ghost') + '" data-act="' + (b.status === 'pending' ? 'admin-reply' : 'admin-booking') + '" data-id="' + b.id + '">' + (b.status === 'pending' ? '回复方案' : '查看方案') + '</button></div></div>').join('');
    const latest = db.bookings.slice(0, 3).map(b => admItem(b)).join('');
    return '<div class="page with-tab">' +
      '<div class="admin-hero"><div class="top"><div class="who"><div class="av">张</div><div><b>张老师</b><span>健康管理中心 · 企业健康服务</span></div></div><div style="display:flex;align-items:center;gap:7px"><button class="bell" data-act="go" data-view="messages">' + icon('bell') + (unread('admin') ? '<i class="dot"></i>' : '') + '</button><button data-act="exit-admin" style="height:30px;padding:0 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);font-size:10px;color:rgba(255,255,255,.7)">客户端</button></div></div>' +
        '<h2>院方工作台</h2><p>' + dateCN(ymd(today())) + ' · 入企活动预约管理</p>' +
        '<div class="admin-stats"><div><b>' + pending.length + '<i>笔</i></b><span>待回复预约</span></div><div><b>' + replied.length + '<i>笔</i></b><span>已回复待确认</span></div><div><b>' + confirmed.length + '<i>场</i></b><span>已确认活动</span></div><div><b>' + db.bookings.length + '<i>笔</i></b><span>累计预约</span></div></div>' +
      '</div>' +
      '<div class="admin-body">' +
        '<div class="admin-sec"><div class="sh"><b>' + icon('alert') + '待办事项</b><span style="font-size:10px;color:var(--muted2)">' + (pending.length + replied.length) + ' 项</span></div>' + (todo || '<div class="card" style="text-align:center;font-size:11px;color:var(--muted2)">暂无待办，所有预约已处理</div>') + '</div>' +
        '<div class="admin-sec"><div class="sh"><b>' + icon('grid') + '快捷入口</b></div><div class="quick-grid">' +
          '<button class="quick" data-act="tab" data-tab="adminList"><span class="qi">' + icon('calendar') + '</span><b>预约管理</b><span>全部预约单</span></button>' +
          '<button class="quick" data-act="tab" data-tab="adminSms"><span class="qi">' + icon('msg') + '</span><b>短信提醒</b><span>规则与记录</span></button>' +
          '<button class="quick" data-act="go" data-view="adminSchedule"><span class="qi">' + icon('clock') + '</span><b>专家排期</b><span>开放 / 关闭时段</span></button>' +
        '</div></div>' +
        '<div class="admin-sec"><div class="sh"><b>' + icon('doc') + '最新预约</b><button class="more" data-act="tab" data-tab="adminList" style="font-size:10px;color:var(--muted)">全部 ' + icon('arrow', 'sm') + '</button></div><div class="adm-list">' + latest + '</div></div>' +
        '<div class="add-note" style="padding-bottom:16px">院方回复方案后，客户将在预约详情与消息中心同步看到</div>' +
      '</div>' +
    '</div>';
  }

  function admItem(b) {
    return '<div class="adm-item" data-act="admin-booking" data-id="' + b.id + '">' +
      '<div class="r1"><span class="org">' + esc(b.org) + '</span>' + statusPill(b.status) + '</div>' +
      '<div class="r2"><span class="doc">' + esc(b.doctorName) + ' · ' + esc(b.format) + ' · ' + b.people + ' 人</span><span class="dt">' + dateCN(b.date) + '</span></div>' +
      '<div class="r3"><span class="oid">' + b.id + ' · ' + timeAgo(b.createdAt) + '</span><span class="go">查看 ' + icon('arrow', 'sm') + '</span></div>' +
    '</div>';
  }
  function admListInner() {
    const q = state.admQ.trim().toLowerCase();
    const list = db.bookings.filter(b => {
      if (state.admFilter !== 'all' && b.status !== state.admFilter) return false;
      if (q && [b.org, b.contact, b.doctorName, b.id].join(' ').toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    return list.length ? list.map(admItem).join('') : '<div class="ex-list-empty">没有符合条件的预约</div>';
  }
  function adminListPage() {
    const n = s => s === 'all' ? db.bookings.length : db.bookings.filter(b => b.status === s).length;
    const filters = [['all', '全部'], ['pending', '待回复'], ['replied', '已回复'], ['confirmed', '已确认'], ['cancelled', '已取消']].map(f => '<button class="' + (state.admFilter === f[0] ? 'on' : '') + '" data-act="adm-filter" data-f="' + f[0] + '">' + f[1] + ' ' + n(f[0]) + '</button>').join('');
    return '<div class="page with-tab">' +
      '<div class="topbar"><div class="tt"><h1>预约管理</h1><span>全部入企活动预约</span></div><button class="act" data-act="go" data-view="messages">' + icon('bell') + (unread('admin') ? '<i class="dot"></i>' : '') + '</button></div>' +
      '<div class="searchbar">' + icon('search') + '<input id="admSearch" value="' + esc(state.admQ) + '" placeholder="搜索单位、联系人或单号">' + (state.admQ ? '<button class="clr" data-act="clear-adm">' + icon('close') + '</button>' : '') + '</div>' +
      '<div class="filters">' + filters + '</div>' +
      '<div class="list" id="admList">' + admListInner() + '</div>' +
    '</div>';
  }

  function adminDetailPage(p) {
    const b = findBooking(p.id) || db.bookings[0];
    if (!b) return adminListPage();
    const doc = findDoc(b.doctorId) || { name: b.doctorName, title: b.doctorTitle, dept: b.doctorDept, photo: b.doctorPhoto };
    return '<div class="page fixed-cta">' +
      '<div class="topbar"><button class="back" data-act="back">' + icon('back') + '</button><div class="tt"><h1>预约详情</h1><span>' + b.id + '</span></div><button class="act" data-act="copy-order" data-order="' + b.id + '">' + icon('copy') + '</button></div>' +
      '<div class="adm-status-bar"><div class="l"><b>' + esc(b.org) + '</b><span>' + timeAgo(b.createdAt) + '提交 · ' + esc(b.contact) + ' ' + maskPhone(b.phone) + '</span></div><div class="r">' + statusPill(b.status) + '</div></div>' +
      '<div class="admin-body">' +
        '<div class="adm-card"><div class="h"><b>' + icon('briefcase') + '活动需求</b></div>' +
          '<div class="kv"><span class="k">活动形式</span><span class="v">' + esc(b.format) + ' · ' + b.people + ' 人</span></div>' +
          '<div class="kv"><span class="k">期望时间</span><span class="v gold">' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + ' ' + SLOTS[b.slot].time + '</span></div>' +
          '<div class="kv"><span class="k">活动城市</span><span class="v">' + esc(b.city) + '</span></div>' +
          '<div class="kv"><span class="k">详细地址</span><span class="v">' + esc(b.address) + '</span></div>' +
          '<div class="kv"><span class="k">期望课题</span><span class="v">' + esc(b.topic) + '</span></div>' +
          (b.note ? '<div class="kv"><span class="k">补充说明</span><span class="v">' + esc(b.note) + '</span></div>' : '') +
          '<div class="kv"><span class="k">联系方式</span><span class="v">' + esc(b.contact) + ' · ' + esc(b.phone) + (b.email ? '<br>' + esc(b.email) : '') + '</span></div>' +
        '</div>' +
        '<div class="adm-card"><div class="h"><b>' + icon('steth') + '预约专家</b><span>' + (b.doctorTier === 1 ? '院士 · 大咖' : b.doctorTier === 2 ? '专家咨询 · 主任' : '专业医生') + '</span></div>' +
          '<div class="expert-line">' + avatar(doc, 'ava') + '<div class="nm"><b>' + esc(b.doctorName) + '</b><span>' + esc(b.doctorTitle || '') + ' · ' + esc(b.doctorDept) + '</span></div><a class="go" href="tel:' + esc(b.phone) + '">联系客户 ' + icon('phone', 'sm') + '</a></div>' +
        '</div>' +
        (b.plan ? '<div class="adm-card" style="padding:0;overflow:hidden">' + planHTML(b).replace('class="plan-card"', 'class="plan-card" style="border:0;margin:0;box-shadow:none"') + '</div>' : '<div class="pending-plan"><div class="pico">' + icon('edit') + '</div><h3>' + (b.status === 'pending' ? '等待院方回复方案' : '方案已发送') + '</h3><p>' + (b.status === 'pending' ? '请确认专家排期后回复课题、会议内容、流程与时间安排' : '客户确认后，活动即进入执行准备') + '</p></div>') +
        '<div class="adm-card"><div class="h"><b>' + icon('clock') + '预约进度</b></div>' + orderTimeline(b) + '</div>' +
        '<div class="add-note" style="padding-bottom:14px">短信提醒状态：' + (db.settings.sms.enabled ? '已开启' : '已关闭') + ' · 院方接收人 ' + db.settings.sms.recipients.map(r => r.name).join('、') + '</div>' +
      '</div>' +
      ((b.status === 'pending' || b.status === 'replied') ? '<div class="bottom-bar"><div class="price"><em>当前状态</em><b style="font-size:13px">' + STATUS[b.status].label + '</b></div>' +
        (b.status === 'pending' ? '<button class="btn gold" data-act="admin-reply" data-id="' + b.id + '">' + icon('edit', 'sm') + '回复方案</button>' : '<button class="btn ghost" data-act="admin-remind" data-id="' + b.id + '">' + icon('msg', 'sm') + '提醒客户</button><button class="btn gold" data-act="admin-reply" data-id="' + b.id + '">修改方案</button>') +
      '</div>' : '') +
    '</div>';
  }

  function addMin(hhmm, mins) {
    const a = String(hhmm || '14:00').split(':').map(Number);
    let total = a[0] * 60 + a[1] + mins;
    total = (total + 1440) % 1440;
    return pad(Math.floor(total / 60)) + ':' + pad(total % 60);
  }
  function defaultAgenda(start, owner) {
    return [
      { time: start, item: '签到与开场', owner: '企业方' },
      { time: addMin(start, 10), item: '专家主题分享', owner: owner },
      { time: addMin(start, 70), item: '互动答疑', owner: owner + ' / 企业方' },
      { time: addMin(start, 100), item: '一对一咨询', owner: '院方团队' }
    ];
  }
  function initReply(b) {
    const doc = findDoc(b.doctorId);
    const topic = b.plan ? b.plan.topic : ((doc && doc.topics && doc.topics[0]) || b.topic);
    const start = b.plan ? b.plan.start : (SLOTS[b.slot] ? SLOTS[b.slot].start : '14:00');
    state.reply = b.plan ? JSON.parse(JSON.stringify(b.plan)) : {
      topic: topic,
      outline: '围绕「' + topic + '」结合企业人群特点与真实案例展开，重点讲解：\n1. 常见风险与早期信号\n2. 科学预防与日常健康管理\n3. 现场互动答疑与个性化建议',
      agenda: defaultAgenda(start, b.doctorName),
      date: b.date, start: start, duration: b.format === '专家咨询' ? '180 分钟' : '90 分钟',
      host: '张老师', hostPhone: '13800138000', note: '', sentAt: 0
    };
    state.reply.bookingId = b.id;
  }
  function replyPage(p) {
    const b = findBooking(p.id) || db.bookings[0];
    if (!b) return adminListPage();
    if (!state.reply || state.reply.bookingId !== b.id) initReply(b);
    const r = state.reply;
    const agRows = (r.agenda || []).map((a, i) => '<div class="ag-row"><input class="tm" data-ag="' + i + '" data-agf="time" value="' + esc(a.time) + '" placeholder="14:00"><input class="it" data-ag="' + i + '" data-agf="item" value="' + esc(a.item) + '" placeholder="环节"><input class="ow" data-ag="' + i + '" data-agf="owner" value="' + esc(a.owner) + '" placeholder="负责人"><button class="del" data-act="reply-del-row" data-i="' + i + '">' + icon('close') + '</button></div>').join('');
    const durations = ['60 分钟', '90 分钟', '120 分钟', '180 分钟', '半天'].map(d => '<option ' + (r.duration === d ? 'selected' : '') + '>' + d + '</option>').join('');
    return '<div class="page fixed-cta">' +
      '<div class="topbar"><button class="back" data-act="back">' + icon('back') + '</button><div class="tt"><h1>回复活动方案</h1><span>' + esc(b.org) + ' · ' + b.id + '</span></div></div>' +
      '<div class="adm-status-bar"><div class="l"><b>' + esc(b.doctorName) + ' · ' + esc(b.format) + '</b><span>客户期望：' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + ' · ' + b.people + ' 人</span></div><div class="r">' + statusPill(b.status) + '</div></div>' +
      '<div class="adm-form">' +
        '<div class="sec"><div class="t"><b>' + icon('doc') + '课题与内容</b><span>客户可见</span></div>' +
          '<div class="field"><label>课题名称</label><input data-reply="topic" value="' + esc(r.topic) + '" placeholder="填写正式活动课题"></div>' +
          '<div class="field"><label>会议内容 / 内容大纲</label><textarea data-reply="outline" style="min-height:146px" placeholder="介绍分享重点、案例与互动安排">' + esc(r.outline) + '</textarea></div>' +
        '</div>' +
        '<div class="sec"><div class="t"><b>' + icon('clock') + '活动流程</b><span>时间 · 环节 · 负责人</span></div>' +
          '<div class="agenda-edit">' + agRows + '</div><button class="ag-add" data-act="reply-add-row">' + icon('plus') + '添加环节</button>' +
        '</div>' +
        '<div class="sec"><div class="t"><b>' + icon('calendar') + '时间安排</b><span>与客户确认</span></div>' +
          '<div class="field"><label>活动日期</label><input type="date" data-reply="date" value="' + esc(r.date) + '"></div>' +
          '<div class="two-col"><div class="field"><label>开始时间</label><input type="time" data-reply="start" value="' + esc(r.start) + '"></div><div class="field"><label>预计时长</label><select data-reply="duration">' + durations + '</select></div></div>' +
        '</div>' +
        '<div class="sec"><div class="t"><b>' + icon('user') + '院方对接人</b><span>客户可见</span></div>' +
          '<div class="two-col"><div class="field"><label>姓名</label><input data-reply="host" value="' + esc(r.host) + '"></div><div class="field"><label>手机号</label><input data-reply="hostPhone" value="' + esc(r.hostPhone) + '" inputmode="numeric" maxlength="11"></div></div>' +
          '<div class="field" style="margin-bottom:0"><label>给客户的备注</label><textarea data-reply="note" style="min-height:78px" placeholder="场地设备、到场时间、物料准备等">' + esc(r.note) + '</textarea></div>' +
        '</div>' +
        '<div class="notice" style="margin:0 0 12px">' + icon('alert') + '<span>发送后客户将在预约详情与消息中心看到完整方案，并收到短信通知。发送前请确认讲者排期。</span></div>' +
      '</div>' +
      '<div class="bottom-bar"><button class="btn ghost" data-act="reply-save" style="flex:0 0 105px">保存草稿</button><button class="btn gold" data-act="reply-send">' + icon('send', 'sm') + '发送方案给客户</button></div>' +
    '</div>';
  }

  function adminSmsPage() {
    const s = db.settings.sms;
    const events = [
      ['newBooking', '新预约即时提醒', '客户提交预约后，立即短信通知院方对接人'],
      ['dailyDigest', '每日待办汇总', '每天 18:00 汇总待回复预约数量'],
      ['replyToClient', '方案回复通知', '院方发送方案后，短信通知客户联系人'],
      ['activityReminder', '活动前提醒', '活动前 ' + s.leadDays + ' 天提醒院方与客户']
    ].map(e => '<div class="event-row"><div class="l"><b>' + e[1] + '</b><span>' + e[2] + '</span></div><label class="sw"><input type="checkbox" data-sms-event="' + e[0] + '" ' + (s.events[e[0]] ? 'checked' : '') + '><i></i></label></div>').join('');
    const recipients = s.recipients.map((r, i) => '<div class="recipient"><span class="ri">' + icon('user') + '</span><div class="rn"><b>' + esc(r.name) + '</b><span>' + esc(r.phone) + '</span></div><button class="del" data-act="sms-del-recipient" data-i="' + i + '">' + icon('close') + '</button></div>').join('');
    const logs = s.logs.slice(0, 10).map(l => '<div class="log"><div class="r1"><span class="t">' + esc(l.event) + '</span><span class="ok">已发送（模拟）</span></div><div class="r2"><span>' + esc(l.toName) + ' · ' + maskPhone(l.toPhone) + '</span><span>' + timeAgo(l.time) + '</span></div><div class="r3">' + esc(l.content) + '</div></div>').join('');
    return '<div class="page with-tab">' +
      '<div class="sms-hero"><div class="top"><button data-act="back">' + icon('back') + '</button><button data-act="sms-save" style="font-size:10px;width:auto;padding:0 11px;border-radius:999px">' + icon('check', 'sm') + '保存</button></div><h2>短信提醒</h2><p>配置院方提醒规则、接收人与短信模板<br>发送记录保存在本机浏览器</p></div>' +
      '<div class="sms-body">' +
        '<div class="swcard"><div class="l"><b>短信提醒总开关</b><span>' + (s.enabled ? '已开启 · 预约与方案节点自动触发' : '已关闭 · 不会生成提醒短信') + '</span></div><label class="sw"><input type="checkbox" data-sms-master ' + (s.enabled ? 'checked' : '') + '><i></i></label></div>' +
        '<div class="card" style="padding:4px 14px;margin-bottom:9px">' + events + '</div>' +
        '<div class="card" style="margin-bottom:9px"><div class="h" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><b style="font-size:12.5px">活动前提醒天数</b><div class="stepper" style="width:116px;height:34px"><button data-act="sms-lead" data-delta="-1">−</button><input value="' + s.leadDays + '" readonly><button data-act="sms-lead" data-delta="1">+</button></div></div><div style="font-size:9.5px;color:var(--muted2);padding-bottom:8px">提前 ' + s.leadDays + ' 天提醒双方确认场地与流程</div></div>' +
        '<div class="card" style="margin-bottom:9px"><div class="h" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px"><b style="font-size:12.5px">院方接收人</b><button class="act" data-act="sms-test" style="font-size:10px;color:var(--brand)">发送测试</button></div>' + (recipients || '<div style="font-size:10px;color:var(--muted2);padding:6px 0">暂无接收人</div>') + '<div class="add-recip"><input class="nm" id="rName" placeholder="姓名"><input id="rPhone" placeholder="手机号" inputmode="numeric" maxlength="11"><button data-act="sms-add-recipient">' + icon('plus', 'sm') + '添加</button></div></div>' +
        '<div class="card" style="margin-bottom:9px"><div style="font-size:12.5px;font-weight:600;margin-bottom:8px">短信模板</div><div class="field"><label style="font-size:10px;color:var(--muted);display:block;margin-bottom:4px">新预约提醒（院方）</label><textarea data-sms-template="newBooking" style="min-height:74px">' + esc(s.templates.newBooking) + '</textarea><div class="vars"><span>{org}</span><span>{doctor}</span><span>{date}</span><span>{time}</span><span>{order}</span></div></div><div class="field" style="margin-top:11px"><label style="font-size:10px;color:var(--muted);display:block;margin-bottom:4px">方案回复通知（客户）</label><textarea data-sms-template="reply" style="min-height:74px">' + esc(s.templates.reply) + '</textarea><div class="vars"><span>{org}</span><span>{doctor}</span><span>{topic}</span><span>{date}</span><span>{order}</span></div></div></div>' +
        '<div class="admin-sec"><div class="sh"><b>' + icon('send') + '发送记录</b><span style="font-size:9.5px;color:var(--muted2)">最近 10 条</span></div>' + (logs || '<div class="card" style="text-align:center;font-size:10.5px;color:var(--muted2)">暂无发送记录</div>') + '</div>' +
        '<div class="add-note">当前版本不接入真实短信网关，发送记录为本地模拟<br>正式上线可对接阿里云 / 腾讯云短信服务</div>' +
      '</div>' +
    '</div>';
  }

  function scheduleDates(doc, count) {
    const out = [];
    let d = addDays(today(), Number(doc.leadDays) || 7);
    for (let i = 0; i < 60 && out.length < (count || 10); i++) {
      const x = addDays(d, i);
      if (x.getDay() === 0) continue;
      out.push(ymd(x));
    }
    return out;
  }
  function adminSchedulePage() {
    const doc = findDoc(state.schedId) || D.doctors[0];
    state.schedId = doc.id;
    const options = [1, 2, 3].map(t => '<optgroup label="' + D.tiers[t].name + '">' + D.doctors.filter(d => d.tier === t).map(d => '<option value="' + d.id + '" ' + (String(d.id) === String(doc.id) ? 'selected' : '') + '>' + esc(d.name) + ' · ' + esc(d.dept) + '</option>').join('') + '</optgroup>').join('');
    const dates = scheduleDates(doc, 10);
    const rows = dates.map(ds => {
      const booked = bookedSet(doc.id, ds);
      const openCount = ['am', 'pm', 'eve'].filter(k => !booked[k] && !isClosed(doc.id, ds, k)).length;
      const slots = ['am', 'pm', 'eve'].map(k => {
        const s = SLOTS[k];
        const isB = !!booked[k], isC = isClosed(doc.id, ds, k);
        return '<button class="sched-slot ' + (isB ? 'booked' : isC ? 'closed' : '') + '" ' + (isB ? 'disabled' : '') + ' data-act="sched-toggle" data-date="' + ds + '" data-slot="' + k + '"><b>' + s.label + '</b><span>' + (isB ? '已约' : isC ? '已关闭' : s.time.split('–')[0] + ' 开放') + '</span></button>';
      }).join('');
      return '<div class="sched-date"><div class="h"><b>' + dateCN(ds) + '</b><span>' + openCount + ' 个时段可约</span></div><div class="sched-slots">' + slots + '</div></div>';
    }).join('');
    return '<div class="page plain">' +
      '<div class="topbar"><button class="back" data-act="back">' + icon('back') + '</button><div class="tt"><h1>专家排期</h1><span>开放 / 关闭可预约时段</span></div></div>' +
      '<div class="admin-body">' +
        '<div class="sched-doctor"><label>选择专家</label><select id="schedDoc">' + options + '</select><div style="font-size:9.5px;color:var(--muted2);margin-top:7px;line-height:1.6">' + esc(doc.name) + ' · ' + esc(doc.title) + ' · ' + doc.leadLabel + '</div></div>' +
        rows +
        '<div class="sched-legend"><span><i class="o"></i>开放预约</span><span><i class="c"></i>已关闭</span><span><i class="b"></i>已预约</span></div>' +
        '<div class="add-note">关闭时段后，客户端将不再展示该时段；已预约时段不可关闭。</div>' +
      '</div>' +
    '</div>';
  }

  const PAGES = {
    home: homePage,
    experts: expertListPage,
    expert: expertPage,
    academicians: academiciansPage,
    book: bookingPage,
    success: successPage,
    my: myPage,
    booking: bookingPageDetail,
    messages: messagesPage,
    profile: profilePage,
    adminLogin: adminLoginPage,
    adminHome: adminHomePage,
    adminList: adminListPage,
    adminDetail: adminDetailPage,
    adminReply: replyPage,
    adminSms: adminSmsPage,
    adminSchedule: adminSchedulePage
  };

  function render(preserve) {
    const cur = current();
    const fn = PAGES[cur.v] || homePage;
    $('#view').innerHTML = fn(cur.p || {});
    const show = state.role === 'admin'
      ? ['adminHome', 'adminList', 'adminSms'].indexOf(cur.v) >= 0
      : ['home', 'experts', 'my', 'profile'].indexOf(cur.v) >= 0;
    const bar = $('#tabbar');
    if (show) { bar.classList.remove('hide'); bar.innerHTML = tabbarHTML(cur.v); }
    else { bar.classList.add('hide'); bar.innerHTML = ''; }
    if (!preserve) window.scrollTo(0, 0);
    else { const y = render._y || 0; requestAnimationFrame(() => window.scrollTo(0, y)); }
  }
  function renderKeep() { render._y = window.scrollY; render(true); }

  function updateExList() {
    const box = $('#exList');
    if (!box) return;
    box.innerHTML = exListInner();
    const c = $('#exCount'); if (c) c.textContent = filteredDoctors().length;
    const clr = $('.searchbar .clr'); if (clr) clr.classList.toggle('hide', !state.q);
  }
  function updateAdmList() {
    const box = $('#admList');
    if (box) box.innerHTML = admListInner();
  }

  function bookingNext() {
    const d = state.draft;
    if (!d) { switchTab('experts'); return; }
    state.err = null;
    if (state.bkStep === 0) {
      if (!d.org || !d.org.trim()) state.err = { f: 'org', msg: '请填写单位名称' };
      else if (!d.address || !d.address.trim()) state.err = { f: 'address', msg: '请填写活动详细地址' };
      else if (!d.people || Number(d.people) < 10) state.err = { f: 'people', msg: '预计人数不少于 10 人' };
      else if (!d.topic) state.err = { f: 'topic', msg: '请选择期望课题' };
    } else if (state.bkStep === 1) {
      if (!d.contact || !d.contact.trim()) state.err = { f: 'contact', msg: '请填写联系人姓名' };
      else if (!/^1[3-9]\d{9}$/.test(String(d.phone || '').trim())) state.err = { f: 'phone', msg: '请填写正确的 11 位手机号' };
      else if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) state.err = { f: 'email', msg: '邮箱格式不正确' };
    } else {
      if (!d.agree) state.err = { f: 'agree', msg: '请先阅读并同意服务说明' };
    }
    if (state.err) { renderKeep(); toast(state.err.msg); return; }
    if (state.bkStep < 2) { state.bkStep += 1; render(); return; }
    submitBooking();
  }

  function submitBooking() {
    const d = state.draft;
    const doc = findDoc(d.doctorId);
    if (!doc) return;
    const now = Date.now();
    const b = {
      id: orderId(), createdAt: now,
      clientType: d.clientType, org: d.org.trim(), format: d.format, city: d.city,
      address: d.address.trim(), people: Number(d.people), topic: d.topic, note: (d.note || '').trim(),
      contact: d.contact.trim(), phone: d.phone.trim(), email: (d.email || '').trim(),
      doctorId: doc.id, doctorName: doc.name, doctorTitle: doc.title, doctorDept: doc.dept,
      doctorPhoto: doc.photo || '', doctorTier: doc.tier,
      date: d.date, slot: d.slot, status: 'pending', plan: null
    };
    db.bookings.unshift(b);
    addMsg('admin', 'new', '新的入企活动预约', b.org + ' 预约 ' + b.doctorName + '，活动时间 ' + dateCN(b.date) + ' ' + SLOTS[b.slot].label + '，请及时回复方案。', b.id);
    smsForBooking(b);
    save();
    state.bkStep = 0; state.bkStep = 0; state.err = null;
    go('success', { id: b.id });
  }

  function confirmPlan(id) {
    const b = findBooking(id);
    if (!b || b.status !== 'replied') return;
    b.status = 'confirmed'; b.confirmedAt = Date.now();
    addMsg('admin', 'confirm', '客户已确认方案', b.org + ' 已确认 ' + b.doctorName + ' 的活动方案，活动时间 ' + dateCN(b.date) + '。', b.id);
    save(); renderKeep(); toast('方案已确认，院方将提前联系您');
  }
  function cancelBooking(id) {
    const b = findBooking(id);
    if (!b) return;
    b.status = 'cancelled'; b.cancelledAt = Date.now();
    addMsg('admin', 'cancel', '客户取消预约', b.org + ' 取消了 ' + b.doctorName + ' 的活动预约，时段已释放。', b.id);
    addSmsLog('取消通知', db.settings.sms.recipients[0] ? db.settings.sms.recipients[0].name : '院方', db.settings.sms.recipients[0] ? db.settings.sms.recipients[0].phone : '', '【北大医疗国际医院】' + b.org + ' 已取消 ' + dateCN(b.date) + ' 的活动预约（' + b.id + '），时段已释放。');
    save(); closeSheet(); renderKeep(); toast('预约已取消');
  }

  function sendReply() {
    const b = findBooking(state.reply && state.reply.bookingId);
    if (!b) return;
    const r = state.reply;
    if (!r.topic || !r.topic.trim()) return toast('请填写课题名称');
    if (!r.outline || !r.outline.trim()) return toast('请填写会议内容');
    if (!r.date || !r.start) return toast('请确认活动日期与开始时间');
    if (!r.host || !r.hostPhone || !/^1[3-9]\d{9}$/.test(r.hostPhone)) return toast('请填写正确的院方对接人与手机号');
    b.plan = {
      topic: r.topic.trim(), outline: r.outline.trim(), agenda: (r.agenda || []).filter(a => a.item || a.time),
      date: r.date, start: r.start, duration: r.duration,
      host: r.host.trim(), hostPhone: r.hostPhone.trim(), note: (r.note || '').trim(), sentAt: Date.now()
    };
    b.status = 'replied';
    b.date = r.date;
    Object.keys(SLOTS).forEach(k => { if (SLOTS[k].start === r.start) b.slot = k; });
    addMsg('client', 'reply', '院方已回复活动方案', b.org + '：' + b.doctorName + ' 的活动方案已回复，课题《' + b.plan.topic + '》，请查看并确认。', b.id);
    smsForReply(b);
    save();
    toast('方案已发送，客户可查看');
    go('adminDetail', { id: b.id });
  }

  function loginAdmin() {
    const u = ($('#aUser') || {}).value || '';
    const p = ($('#aPass') || {}).value || '';
    if (u.trim() === 'PKU-HMC-001' && p === '123456') {
      state.role = 'admin'; sessionStorage.setItem(ROLE_KEY, 'admin');
      switchTab('adminHome');
      setTimeout(() => toast('已进入院方工作台'), 60);
    } else {
      toast('工号或密码不正确');
    }
  }
  function exitAdmin() {
    state.role = 'client'; sessionStorage.removeItem(ROLE_KEY);
    switchTab('home');
  }

  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.getAttribute('data-act');
    if (el.disabled) return;
    if (act === 'close-sheet' && e.target.closest('.sheet')) return;
    switch (act) {
      case 'tab': switchTab(el.dataset.tab); break;
      case 'go': go(el.dataset.view, { id: el.dataset.id || '' }); break;
      case 'back': back(); break;
      case 'tier': state.filterTier = el.dataset.tier; state.filterDept = 'all'; state.q = ''; switchTab('experts'); break;
      case 'filter-tier': state.filterTier = el.dataset.tier; state.filterDept = 'all'; renderKeep(); break;
      case 'filter-dept': state.filterDept = el.dataset.dept; renderKeep(); break;
      case 'clear-search': state.q = ''; render(); break;
      case 'expert': go('expert', { id: el.dataset.id }); break;
      case 'set-date': state.selDate = el.dataset.date; state.selSlot = ''; renderKeep(); break;
      case 'set-slot': state.selSlot = el.dataset.slot; renderKeep(); break;
      case 'start-booking': {
        const doc = findDoc(el.dataset.id);
        if (!doc || !state.selSlot) return;
        state.draft = {
          doctorId: doc.id, clientType: '保险公司', org: '', format: doc.formats[0], city: '北京',
          address: '', people: 100, topic: doc.topics[0], note: '', contact: '', phone: '', email: '',
          needCall: true, agree: false, date: state.selDate, slot: state.selSlot
        };
        state.bkStep = 0; state.err = null; go('book');
        break;
      }
      case 'bk-back': if (state.bkStep > 0) { state.bkStep--; state.err = null; render(); } else back(); break;
      case 'bk-next': bookingNext(); break;
      case 'set-draft': state.draft[el.dataset.field] = el.dataset.value; state.err = null; renderKeep(); break;
      case 'people': state.draft.people = Math.max(10, Math.min(1000, Number(state.draft.people || 100) + Number(el.dataset.delta))); renderKeep(); break;
      case 'copy-order': copyText(el.dataset.order); break;
      case 'confirm-plan': confirmPlan(el.dataset.id); break;
      case 'cancel-booking': openSheet('<h3>取消本次预约</h3><p>取消后该时段将释放给其他客户，院方会收到取消通知。<br>此操作不可撤销。</p><div class="acts"><button class="btn ghost" data-act="close-sheet">保留预约</button><button class="btn danger" data-act="do-cancel" data-id="' + el.dataset.id + '">确认取消</button></div>'); break;
      case 'do-cancel': cancelBooking(el.dataset.id); break;
      case 'close-sheet': closeSheet(); break;
      case 'open-msg': {
        const m = db.msgs.find(x => x.id === el.dataset.id);
        if (!m) return;
        m.read = true; save();
        if (m.orderId) { go(state.role === 'admin' ? 'adminDetail' : 'booking', { id: m.orderId }); }
        else render();
        break;
      }
      case 'read-all': db.msgs.filter(m => m.to === (state.role === 'admin' ? 'admin' : 'client')).forEach(m => m.read = true); save(); render(); toast('已全部标为已读'); break;
      case 'sharePage': copyText(location.href); break;
      case 'profileNotice': openSheet('<h3>活动须知</h3><p style="text-align:left">1. 预约提交后，院方将在 1 个工作日内回复课题、会议内容、流程与时间安排。<br>2. 专家排期为初步开放时段，以院方最终确认为准。<br>3. 活动场地、投影、麦克风等由预约方准备；院方可协助提供设备清单。<br>4. 如需改期或取消，请提前联系院方对接人；活动前 7 天内取消可能产生已发生的差旅费用。<br>5. 专家讲座内容用于健康科普，不替代个体诊疗。</p><div class="acts"><button class="btn navy" data-act="close-sheet">知道了</button></div>'); break;
      case 'profileAbout': openSheet('<h3>关于平台</h3><p style="text-align:left">北大医疗国际医院面向保险公司与企业客户提供的专家讲座、入企健康活动预约平台。<br><br>平台整合北大医疗集团院士专家顾问团、院方科室主任与专业医生资源，按活动规模分为院士·大咖、专家咨询·主任、专业医生三级，支持在线选择专家与可约时段，并由院方健康管理中心统一回复活动方案。</p><div class="acts"><button class="btn navy" data-act="close-sheet">知道了</button></div>'); break;
      case 'admin-login': loginAdmin(); break;
      case 'exit-admin': exitAdmin(); break;
      case 'admin-booking': go('adminDetail', { id: el.dataset.id }); break;
      case 'admin-reply': { const b = findBooking(el.dataset.id); if (b) { initReply(b); go('adminReply', { id: b.id }); } break; }
      case 'admin-remind': {
        const b = findBooking(el.dataset.id); if (!b) return;
        const s = db.settings.sms;
        if (s.enabled && s.events.activityReminder) addSmsLog('活动提醒', b.contact, b.phone, renderTpl(s.templates.reminder, { org: b.org, doctor: b.doctorName, date: dateCN(b.date), time: SLOTS[b.slot].label + ' ' + SLOTS[b.slot].time, order: b.id }));
        save(); toast('已向客户发送活动提醒短信'); break;
      }
      case 'adm-filter': state.admFilter = el.dataset.f; renderKeep(); break;
      case 'clear-adm': state.admQ = ''; render(); break;
      case 'reply-add-row': state.reply.agenda.push({ time: '', item: '', owner: '' }); renderKeep(); break;
      case 'reply-del-row': state.reply.agenda.splice(Number(el.dataset.i), 1); renderKeep(); break;
      case 'reply-save': { const b = findBooking(state.reply.bookingId); if (b) { b.planDraft = JSON.parse(JSON.stringify(state.reply)); save(); toast('草稿已保存'); } break; }
      case 'reply-send': sendReply(); break;
      case 'sms-lead': { const s = db.settings.sms; s.leadDays = Math.max(1, Math.min(30, s.leadDays + Number(el.dataset.delta))); save(); renderKeep(); break; }
      case 'sms-add-recipient': {
        const n = ($('#rName') || {}).value || '', p = ($('#rPhone') || {}).value || '';
        if (!n.trim()) return toast('请填写接收人姓名');
        if (!/^1[3-9]\d{9}$/.test(p.trim())) return toast('请填写正确的手机号');
        db.settings.sms.recipients.push({ name: n.trim(), phone: p.trim() }); save(); renderKeep(); toast('接收人已添加'); break;
      }
      case 'sms-del-recipient': { db.settings.sms.recipients.splice(Number(el.dataset.i), 1); save(); renderKeep(); break; }
      case 'sms-save': save(); toast('短信配置已保存'); break;
      case 'sms-test': {
        const s = db.settings.sms; const r = s.recipients[0];
        if (!r) return toast('请先添加院方接收人');
        addSmsLog('测试短信', r.name, r.phone, renderTpl(s.templates.newBooking, { org: '测试企业', doctor: '于存涛', date: dateCN(ymd(addDays(today(), 30))), time: '上午 09:30–11:30', order: 'PKU-TEST-001' }));
        save(); renderKeep(); toast('测试短信已生成'); break;
      }
      case 'sched-toggle': {
        const key = state.schedId + '|' + el.dataset.date + '|' + el.dataset.slot;
        const i = db.closed.indexOf(key);
        if (i >= 0) db.closed.splice(i, 1); else db.closed.push(key);
        save(); renderKeep(); break;
      }
      default: break;
    }
  });

  document.addEventListener('input', function (e) {
    const t = e.target;
    if (t.id === 'exSearch') { state.q = t.value; updateExList(); return; }
    if (t.id === 'admSearch') { state.admQ = t.value; updateAdmList(); return; }
    if (t.dataset.model) {
      const key = t.dataset.model;
      state.draft[key] = t.type === 'number' ? Number(t.value) : t.value;
      if (state.err && state.err.f === key) { state.err = null; }
      return;
    }
    if (t.dataset.reply) { state.reply[t.dataset.reply] = t.value; return; }
    if (t.dataset.ag != null) {
      const i = Number(t.dataset.ag), f = t.dataset.agf;
      if (state.reply.agenda[i]) state.reply.agenda[i][f] = t.value;
      return;
    }
    if (t.dataset.smsTemplate) { db.settings.sms.templates[t.dataset.smsTemplate] = t.value; save(); return; }
    if (t.dataset.reply && t.tagName === 'SELECT') { state.reply[t.dataset.reply] = t.value; return; }
  });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t.dataset.model) {
      state.draft[t.dataset.model] = t.type === 'checkbox' ? t.checked : t.value;
      return;
    }
    if (t.dataset.reply) { state.reply[t.dataset.reply] = t.value; return; }
    if (t.hasAttribute('data-sms-master')) { db.settings.sms.enabled = t.checked; save(); renderKeep(); return; }
    if (t.dataset.smsEvent) { db.settings.sms.events[t.dataset.smsEvent] = t.checked; save(); return; }
    if (t.id === 'schedDoc') { state.schedId = t.value; renderKeep(); return; }
  });

  render();
})();
