import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    rules: {
      // マウント時のfetch・永続化状態の復元・ルート遷移時のリセットなど、
      // 一般的で意図的なuseEffect内setStateも一律errorになるため、
      // 個別の妥当性判断を妨げないようwarnに留める
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
