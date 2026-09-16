import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { testProgressAPI, humanProfileAPI } from '../utils/api'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ── 流程
// AI 路径:    method → data(AI拍照) → skeleton(AI预填) → flesh → 完成后直接跳风格测试面部测试
// 手动路径:   method → data(三围输入) → skeleton → flesh → 完成后直接跳风格测试面部测试
// 2026-08-31 调整：不再单独展示体型档案报告页，测完直接进风格测试；所有结果统一在 ProfilePage 展示，也不再用体型轮廓图。
// 2026-09-04 调整：原本放在这里的"气血态"4 题（气质印象/身体线条/面部线条/气场评价）已经整体挪到
// 面部测试完成之后的独立模块"整体风格复核"（STEP 03），不再属于体型测试的一部分，
// 相关的 phase/state/计算函数已从本文件移除，详见 aiffd-frontend 项目里新的"整体风格复核"页面。
// 注意：那 4 题算出的结果（qiXueState）不只用于风格判定，色彩测试那边也依赖它计算五行，
// 新模块必须保留同样的 localStorage 存储行为（key
