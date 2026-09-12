import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// 视觉系统与 OnboardingPage / ConsentScreen 保持一致：
// 金色强调 #B8973A，Georgia 衬线做标题，Inter 无衬线做正文，暖白背景。
const C = {
  bg: '#faf9f7', h1: '#171111', h2: '#1a1a1a', body: '#555', muted: '#999',
  gold: '#B8973A', border: '#e8e8e4', goldBg: '#fdf8ee',
}

// 文档来源：《AIFFD隐私政策与研究测试数据说明》V1.1（2026-09），仅取"第一部分 网站公开版"的正文。
// 第二部分（授权界面文案指导）和第三部分（发布前技术确认清单，含"待技术确认"占位）是开发/合规内部材料，
// 不应该出现在这个公开页面上——第三部分里的服务商、存储地区等信息一旦技术确认完，
// 应该补充进"五 境外处理和数据存储"这一节，而不是整体照搬清单表格。
type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

interface Section { heading: string; blocks: Block[] }

const POLICY_VERSION = '版本 1.1'
const POLICY_DATE = '生效日期：2026年9月'

const INTRO: string[] = [
  '欢迎参与AIFFD智搭研究原型测试。AIFFD是一个探索个人风格、色彩特征与视觉推荐方法的独立研究项目，目前处于非商业研究和原型测试阶段。',
  '本项目面向年满18周岁的成年测试参与者。测试结果用于个人风格探索与研究验证，不构成医疗、心理、就业、身份评价或其他专业意见。',
  '请在参加测试前仔细阅读本政策。我们将根据不同的数据处理目的分别征求您的同意。您可以只同意完成基础测试所必需的数据处理，而不参加照片分析、研究与模型改进、第三方共享等可选项目。',
]

const SECTIONS: Section[] = [
  {
    heading: '一 项目负责人及个人信息处理责任',
    blocks: [
      { type: 'p', text: 'AIFFD是由Zenya He发起的独立研究项目。目前，Zenya He负责决定本项目中个人信息的收集、使用、存储和管理方式。' },
      { type: 'ul', items: ['隐私联系邮箱：hello@aiffd.com', '项目网站：aiffd.com'] },
      { type: 'p', text: '如您对个人信息处理有疑问，或者希望访问、更正、删除数据及撤回同意，可以通过上述邮箱联系我们。我们原则上将在收到完整请求后15个工作日内回复。为保护数据安全，我们可能需要核实请求人的身份。' },
      { type: 'p', text: '本说明不表示AIFFD当前作为商业服务提供。' },
    ],
  },
  {
    heading: '二 我们收集的个人信息',
    blocks: [
      { type: 'p', text: '2.1 基础账户信息' },
      { type: 'ul', items: ['用户名、电子邮箱地址以及用于登录验证的信息', '注册时间、最后登录时间和账户状态'] },
      { type: 'p', text: '密码应以不可逆散列方式保存。我们不会在可读取状态下保存您的登录密码。' },
      { type: 'p', text: '2.2 风格档案和问卷信息' },
      { type: 'ul', items: [
        '年龄段、身高、体重以及身体轮廓相关选择',
        '体型、面部特征、肤色倾向、发色、虹膜颜色和其他风格测试答案',
        '风格偏好、生活场景、预算区间、穿衣困扰和需求描述',
        '由测试答案生成的Style Profile、色彩定位、风格判断和推荐结果',
      ] },
      { type: 'p', text: '2.3 图像信息和敏感个人信息' },
      { type: 'p', text: '个人照片、穿搭照片，以及由图像分析推断出的面部、体型、肤色等特征可能属于敏感个人信息。只有在相关功能启用、您主动上传并单独明确同意后，我们才会处理这些信息。' },
      { type: 'ul', items: [
        '您主动上传用于风格或色彩分析的个人照片',
        '您上传用于服装或商品分析的服装图片',
        '您在连接真人造型师功能中另行授权共享的照片',
      ] },
      { type: 'p', text: '不上传个人照片不会影响您使用不依赖照片的基础问卷功能。' },
      { type: 'p', text: '2.4 可选择用于研究和系统改进的数据' },
      { type: 'p', text: '只有在您主动勾选并单独同意后，我们才会将授权范围内的数据用于研究、系统评估或模型改进。不同意该用途不会影响您完成基础测试或获取测试结果。' },
      { type: 'p', text: '未经单独同意，我们不会将您上传的个人照片用于AI模型训练。您可以随时撤回该项同意。撤回不影响撤回前已经合法完成的数据处理，但我们将停止把相关个人信息用于后续研究或模型改进。' },
      { type: 'p', text: '2.5 使用行为和技术数据' },
      { type: 'ul', items: [
        '页面访问记录、点击行为、功能使用频次和错误日志',
        '设备类型、操作系统、浏览器版本和语言设置',
        'IP地址及安全验证信息；IP地址可能反映大致地区，但不用于精确追踪个人位置',
      ] },
      { type: 'p', text: '如使用Cookie或第三方分析工具，我们将在确认具体技术服务后补充说明其名称、用途和关闭方式。' },
    ],
  },
  {
    heading: '三 数据使用目的',
    blocks: [
      { type: 'p', text: '我们仅在完成相应目的所必需的范围内处理个人信息：' },
      { type: 'ul', items: [
        '创建和维护账户，完成身份验证和安全保护',
        '处理测试答案，生成和持续更新个人Style Profile',
        '提供风格、色彩、穿搭和服装适配方面的研究性分析结果',
        '发送账户、安全、隐私政策变更和测试状态等必要通知',
        '处理访问、更正、删除、撤回同意和其他个人信息权利请求',
        '在获得单独同意后，用于研究、系统评估和模型改进',
        '在用户主动发起并单独授权后，向指定的第三方造型师共享特定信息',
      ] },
      { type: 'p', text: '我们不会出售个人信息，也不会将个人信息提供给广告商用于其独立广告营销。若未来的数据用途发生实质变化，我们将在新用途开始前进行说明，并在需要时重新取得同意。' },
    ],
  },
  {
    heading: '四 第三方服务及数据共享',
    blocks: [
      { type: 'p', text: '4.1 技术服务提供商' },
      { type: 'p', text: '为了提供网站托管、账户、数据库、文件存储、邮件、安全、访问分析或AI功能，我们可能委托技术服务提供商处理必要数据。服务商只能按照我们的指示和约定目的处理数据，并应采取相应安全措施。实际服务商、处理的数据类型和存储地区将在技术配置确认后补充公开。' },
      { type: 'p', text: '4.2 第三方造型师' },
      { type: 'p', text: '第三方造型师连接功能目前尚未正式开放。AIFFD不会因为参与者完成基础测试而自动向任何造型师共享数据。' },
      { type: 'p', text: '该功能未来启用时，只有在参与者主动发起连接、查看具体共享内容和接收方信息，并进行单独确认后，才会发生数据共享。参与者可以选择部分授权，也可以撤回对特定造型师的后续访问权限。' },
      { type: 'p', text: '可能共享的信息仅限于参与者明确选择的内容，例如风格档案摘要、授权照片、场景需求和系统生成的分析结果。第三方造型师不得擅自转让、出售或用于其他目的。' },
      { type: 'p', text: '4.3 法律和安全所需披露' },
      { type: 'p', text: '在适用法律明确要求，或者为保护测试参与者、项目和他人的合法权益与安全确有必要时，我们可能在法律允许的范围内披露必要信息，并保留相关处理记录。' },
    ],
  },
  {
    heading: '五 境外处理和数据存储',
    blocks: [
      { type: 'p', text: '5.1 存储位置和跨境处理' },
      { type: 'p', text: 'AIFFD可能使用位于测试参与者所在国家或地区之外的技术服务处理或存储数据。正式扩大测试前，我们将公布实际服务商名称、服务类型、处理的数据类别、存储国家或地区及其隐私政策链接。' },
      { type: 'p', text: '如适用法律要求对跨境提供个人信息取得单独同意，我们将在传输发生前向参与者说明境外接收方、联系方式、处理目的、处理方式、信息种类和权利行使方法，并取得单独同意。' },
      { type: 'p', text: '5.2 数据保留期限' },
      { type: 'ul', items: [
        '账户数据：账户存续期间保留；账户注销后原则上于30日内删除，法律另有要求的除外',
        '风格档案和测试数据：账户存续期间保留；删除账户或提出删除请求后原则上于30日内删除',
        '个人照片：按照单独授权的期限保留；授权到期、撤回或删除请求核实后原则上于7日内删除',
        '安全日志：在完成安全、审计和防滥用目的所需的合理期限内保留',
        '研究和系统改进数据：仅在参与者单独同意的授权范围和期限内保留',
      ] },
      { type: 'p', text: '去标识化数据仍将按照个人信息进行保护。只有经过真正匿名化、无法识别且无法恢复到特定个人的数据，才可能在不再属于个人信息的前提下用于长期研究。备份系统中的删除可能需要合理的技术周期；在此期间相关数据将被隔离，除恢复安全事故外不再使用。' },
    ],
  },
  {
    heading: '六 数据安全',
    blocks: [
      { type: 'ul', items: [
        '数据传输采用HTTPS或TLS等加密措施',
        '密码采用不可逆散列方式保存',
        '个人照片和敏感信息采用访问权限控制，仅限完成相应任务所必需的授权人员访问',
        '根据最小必要原则限制数据访问，并保留必要的安全日志',
        '定期评估数据风险、第三方服务和访问权限',
      ] },
      { type: 'p', text: '互联网服务无法保证绝对安全。如发生可能对您权益造成影响的个人信息安全事件，我们将依法采取补救措施，并在适用法律要求的情况下通知相关参与者和主管机关。' },
    ],
  },
  {
    heading: '七 您的个人信息权利',
    blocks: [
      { type: 'p', text: '在适用法律规定的范围内，您可以通过hello@aiffd.com提出以下请求：' },
      { type: 'ul', items: [
        '查阅和获取我们持有的您的个人信息',
        '更正或补充不准确、不完整的信息',
        '删除全部或部分个人信息',
        '撤回此前作出的同意',
        '在技术可行并符合法律要求时，以通用格式导出部分档案数据',
        '了解系统生成风格判断和推荐结果的主要依据，并提交反馈或请求人工说明',
        '拒绝仅由自动化处理作出、且对个人权益产生重大影响的决定',
      ] },
      { type: 'p', text: 'AIFFD当前提供的是研究性风格推荐，不用于作出具有法律效力或对个人产生类似重大影响的决定。撤回同意不影响撤回前已经依法完成的数据处理。' },
    ],
  },
  {
    heading: '八 未成年人保护',
    blocks: [
      { type: 'p', text: 'AIFFD当前测试仅面向年满18周岁的成年人，不以未成年人为目标参与者，也不故意收集未成年人的个人信息。如我们发现未成年人提交了个人信息，将停止相关处理并删除数据。监护人如发现未成年人向项目提交了信息，请通过hello@aiffd.com联系我们。' },
    ],
  },
  {
    heading: '九 政策变更',
    blocks: [
      { type: 'p', text: '我们可能根据法律变化、研究范围、系统功能或技术服务调整本政策。更新后的政策将在网站公布并注明新的版本和生效日期。' },
      { type: 'p', text: '如果变更涉及处理目的、敏感个人信息、研究与模型改进、第三方共享或跨境传输等实质性调整，我们将在变更生效前以合理方式通知您，并在适用法律要求时重新取得同意。' },
    ],
  },
  {
    heading: '十 联系我们',
    blocks: [
      { type: 'ul', items: [
        '项目名称：AIFFD独立研究项目',
        '项目负责人及个人信息联系人：Zenya He',
        '电子邮箱：hello@aiffd.com',
        '项目网站：aiffd.com',
      ] },
      { type: 'p', text: '我们原则上将在收到完整请求后15个工作日内回复。' },
    ],
  },
]

const pStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, margin: '0 0 16px',
}
const ulStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '20px' }
const liStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, marginBottom: '6px',
}

function renderBlock(b: Block, i: number) {
  if (b.type === 'p') {
    // 2.1/2.2.../4.1/4.2... 这种小节序号行，视觉上升一级，用金色小标题呈现，不当正文段落处理
    const isSubHeading = /^\d\.\d /.test(b.text)
    if (isSubHeading) {
      return (
        <p key={i} style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, letterSpacing: '1px',
          margin: '28px 0 12px', fontWeight: 600,
        }}>{b.text}</p>
      )
    }
    return <p key={i} style={pStyle}>{b.text}</p>
  }
  return (
    <ul key={i} style={ulStyle}>
      {b.items.map((it, j) => <li key={j} style={liStyle}>{it}</li>)}
    </ul>
  )
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>AIFFD 智搭</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 400, color: C.h1, margin: '0 0 8px', lineHeight: 1.3 }}>
          AIFFD隐私政策与研究测试数据说明
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginBottom: '28px' }}>
          {POLICY_VERSION} · {POLICY_DATE}
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <Link to="/about" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>
            查看《AIFFD在线测试说明》 →
          </Link>
          <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>
            ← 返回测试授权页
          </Link>
        </div>

        <div style={{ background: C.goldBg, padding: '20px 24px', borderLeft: `3px solid ${C.gold}`, marginBottom: '48px' }}>
          {INTRO.map((t, i) => (
            <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: 1.9, margin: i < INTRO.length - 1 ? '0 0 12px' : 0 }}>
              {t}
            </p>
          ))}
        </div>

        {SECTIONS.map((s, i) => (
          <div key={s.heading} style={{ marginBottom: '40px', paddingBottom: i < SECTIONS.length - 1 ? '40px' : 0, borderBottom: i < SECTIONS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, margin: '0 0 16px' }}>
              {s.heading}
            </h2>
            {s.blocks.map(renderBlock)}
          </div>
        ))}

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: `1px solid ${C.border}` }}>
          <Link to="/about" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>
            查看《AIFFD在线测试说明》 →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
