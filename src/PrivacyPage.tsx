const C = {
  h1: '#111111', h2: '#222222', body: '#666666',
  muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

const sections = [
  {
    title: '一、数据控制者信息',
    content: [
      '本平台由 AIFFD 运营。如您对本协议或您的个人信息处理有任何疑问，请通过以下方式联系我们：',
      '· 电子邮件：hello@aiffd.com',
      '· 平台域名：aiffd.com',
      '我们将在收到您的请求后 15 个工作日内予以回复。',
    ],
  },
  {
    title: '二、我们收集的个人信息',
    content: [
      '2.1 基础账户信息',
      '· 用户名、电子邮件地址、登录密码（加密存储）',
      '· 注册时间、最后登录时间',
      '2.2 风格档案信息（问卷填写）',
      '· 年龄段、身高、体重',
      '· 体型类型（如戏剧型、浪漫型、自然型等）',
      '· 肤色倾向、发色、风格偏好、生活场景、预算区间',
      '· 穿衣困扰与需求描述',
      '2.3 图像信息（敏感个人信息）',
      '以下为敏感个人信息，我们将在单独征得您明示同意后方可收集：',
      '· 您主动上传的个人穿搭照片',
      '· 您上传用于商品分析的服装图片',
      '· 您授权提供给造型师参考的外貌照片',
      '2.4 用于 AI 模型训练的数据',
      '我们可能将您提供的风格档案数据（含图像信息）用于改进本平台 AI 模型的训练与优化。如您不同意，可发送邮件至 hello@aiffd.com 申请退出（Opt-out），退出后不影响您继续使用其他功能。',
      '2.5 使用行为数据',
      '· 页面访问记录、点击行为、功能使用频次',
      '· 设备类型、操作系统、浏览器版本',
      '· IP 地址（用于安全验证，不用于追踪个人位置）',
    ],
  },
  {
    title: '三、数据使用目的',
    content: [
      '我们收集和使用您的个人信息，仅限于以下目的：',
      '· 提供、维护和改进本平台的风格档案与商品分析服务',
      '· 生成和持续优化您的个人 Style Profile',
      '· 在您授权的情况下，将相关信息共享给第三方造型师为您提供专属服务',
      '· 改进本平台 AI 算法和模型（需单独获得您的同意）',
      '· 发送与您账户或服务相关的重要通知',
      '· 保障平台安全、防范欺诈和违规行为',
      '我们不会将您的个人信息用于上述目的之外的任何商业用途，亦不会向广告商出售您的个人数据。',
    ],
  },
  {
    title: '四、向第三方造型师共享数据',
    content: [
      '4.1 共享的前提条件',
      '· 仅在您明确选择"连接造型师服务"并单独确认授权后，方可触发数据共享',
      '· 每次共享前，系统将向您展示具体共享内容清单，您可选择部分授权',
      '· 您可随时撤回对特定造型师的数据授权',
      '4.2 可能共享的数据范围',
      '· 您的风格档案摘要（体型、色彩、风格偏好、场景需求）',
      '· 您主动授权的个人照片或穿搭图片',
      '· 您与本平台 AI 互动中产生的风格判断结论',
      '4.3 第三方造型师的义务',
      '所有接入本平台的第三方造型师须签署《造型师数据保密协议》，承诺仅将您的数据用于为您提供造型服务，不得转让、出售或用于其他商业目的，服务结束后按约定期限删除您的数据。',
    ],
  },
  {
    title: '五、数据存储与安全',
    content: [
      '5.1 存储位置',
      '本平台当前使用境外服务器存储用户数据。您的个人信息可能被存储在中国大陆境外的服务器上。我们将持续评估合规要求，并在必要时采取标准合同或其他合规措施。',
      '5.2 数据保留期限',
      '· 账户数据：自您注销账户之日起 30 日内删除',
      '· 风格档案数据：账户存续期间保留，注销后 30 日内删除',
      '· 图像数据：依据您的授权期限保留，期满或撤权后 7 日内删除',
      '· 用于 AI 训练的去标识化数据：可能在去标识化后长期保留，不可溯源至个人',
      '5.3 安全措施',
      '· 所有传输数据采用 HTTPS/TLS 加密',
      '· 密码采用不可逆加密算法存储',
      '· 图像数据访问采用权限控制，仅授权人员可访问',
    ],
  },
  {
    title: '六、您的个人信息权利',
    content: [
      '依据《个人信息保护法》，您对自己的个人信息享有以下权利：',
      '· 查阅权：您可随时查阅我们持有的您的个人信息',
      '· 更正权：如您发现信息有误，可申请更正',
      '· 删除权：您可申请删除您的全部或部分个人信息',
      '· 撤回同意权：您可随时撤回此前给予的同意（不影响撤回前已进行的处理）',
      '· 数据可携权：您可申请将您的档案数据以通用格式导出',
      '· 拒绝自动化决策权：您可拒绝仅基于自动化处理作出对您有重大影响的决策',
      '如需行使上述权利，请发送邮件至 hello@aiffd.com，并在邮件主题中注明"个人信息权利申请"。我们将在 15 个工作日内处理您的请求。',
    ],
  },
  {
    title: '七、未成年人保护',
    content: [
      '本平台的目标用户为成年人（18周岁及以上），尤其面向 40+ 女性群体。我们不会故意收集未成年人的个人信息。如我们发现账户持有人为未成年人，将立即删除相关账户数据。',
      '如您是未成年人的监护人，发现未成年人向本平台提供了个人信息，请立即联系我们：hello@aiffd.com。',
    ],
  },
  {
    title: '八、协议变更',
    content: [
      '我们可能因法律法规变化、服务调整或业务发展需要，对本协议进行修订。修订后的协议将在本平台公示，并通过注册邮件通知您。',
      '如变更涉及您个人信息处理方式的实质性调整，我们将在变更生效前至少 30 日通知您，并重新获取您的同意。',
    ],
  },
  {
    title: '九、联系我们',
    content: [
      '如您对本协议有任何疑问、投诉或建议，请通过以下方式联系我们：',
      '· 电子邮件：hello@aiffd.com',
      '· 平台网址：aiffd.com',
      '我们承诺在收到您的请求后 15 个工作日内予以回复。',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px 96px' }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '40px', marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>
            AIFFD 智搭
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '12px', lineHeight: '1.3' }}>
            用户隐私政策与数据使用协议
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>
            版本 1.0　·　生效日期：2026年5月
          </p>
        </div>

        {/* 引言 */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: '2.0', marginBottom: '12px' }}>
            欢迎使用 AIFFD 智搭。本平台是一个面向 40+ 女性的购买前风格决策系统，致力于帮助用户建立个人风格档案并提供专业的穿搭判断支持。
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: '2.0', marginBottom: '12px' }}>
            在您使用本平台服务之前，请仔细阅读本协议。本协议依据《个人信息保护法》《网络安全法》《数据安全法》及相关法规制定。
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: '2.0' }}>
            您点击「同意并开始」或继续使用本平台，即表示您已阅读、理解并同意接受本协议的全部条款。
          </p>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h1, marginBottom: '20px' }}>
              {s.title}
            </h2>
            {s.content.map((line, j) => {
              const isSub = line.startsWith('·')
              const isSubhead = /^\d+\.\d+/.test(line)
              return (
                <p key={j} style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isSub ? '14px' : isSubhead ? '14px' : '15px',
                  color: isSubhead ? C.h2 : C.body,
                  fontWeight: isSubhead ? 500 : 400,
                  lineHeight: '1.9',
                  marginBottom: '6px',
                  paddingLeft: isSub ? '16px' : '0',
                }}>
                  {line}
                </p>
              )
            })}
          </div>
        ))}

        {/* Footer */}
        <div style={{ paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>
            AIFFD 智搭　·　hello@aiffd.com　·　aiffd.com
          </p>
        </div>

      </div>
    </div>
  )
}
