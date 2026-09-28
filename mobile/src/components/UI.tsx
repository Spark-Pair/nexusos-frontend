import type { PropsWithChildren, ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useAppColors } from '../theme'

export function BrandMark({ size = 44 }: { size?: number }) {
  const c = useAppColors()
  return <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: size * 0.45, fontWeight: '800' }}>N</Text>
  </View>
}

export function PrimaryButton({ title, onPress, loading, disabled, icon }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; icon?: ReactNode }) {
  const c = useAppColors()
  return <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.primary, { backgroundColor: c.accent, opacity: pressed ? 0.84 : disabled ? 0.5 : 1 }]}>
    {loading ? <ActivityIndicator color="#fff" /> : <>{icon}{<Text style={styles.primaryText}>{title}</Text>}</>}
  </Pressable>
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, autoCapitalize = 'none', keyboardType }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; keyboardType?: 'default' | 'email-address'
}) {
  const c = useAppColors()
  return <View style={styles.fieldWrap}><Text style={[styles.label, { color: c.text }]}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={c.muted}
      secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} keyboardType={keyboardType}
      style={[styles.input, { color: c.text, backgroundColor: c.surface, borderColor: c.border }]} selectionColor={c.accent} />
  </View>
}

export function Page({ children }: PropsWithChildren) {
  const c = useAppColors()
  return <View style={[styles.page, { backgroundColor: c.background }]}>{children}</View>
}

export function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  const c = useAppColors()
  return <View style={styles.empty}><View style={[styles.emptyIcon, { backgroundColor: c.surfaceAlt }]}>{icon}</View>
    <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text><Text style={[styles.emptyDetail, { color: c.muted }]}>{detail}</Text>{action}</View>
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  primary: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fieldWrap: { gap: 8 }, label: { fontSize: 13, fontWeight: '600' },
  input: { height: 52, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyDetail: { marginTop: 7, fontSize: 14, lineHeight: 21, textAlign: 'center' },
})
