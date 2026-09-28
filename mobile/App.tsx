import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native'
import { createNavigationContainerRef, NavigationContainer, useIsFocused, useNavigation, useRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as SecureStore from 'expo-secure-store'
import * as Haptics from 'expo-haptics'
import * as ImagePicker from 'expo-image-picker'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { io, type Socket } from 'socket.io-client'
import { Archive, Bell, Check, CheckCheck, ChevronLeft, CircleHelp, ImagePlus, Inbox, ListChecks, LogOut, MessageCircle, Mic, MoreVertical, Pause, Play, Send, Settings2, Square, Trash2, Users, X } from 'lucide-react-native'
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import { api, API_ORIGIN, ApiError } from './src/api'
import type { AccountKind, Conversation, ConversationDetail, Message, Session, User } from './src/types'
import { BrandMark, EmptyState, Field, Page, PrimaryButton } from './src/components/UI'
import { BroadcastFeedScreen, BroadcastListsScreen, NewBroadcastScreen } from './src/components/BroadcastScreens'
import { useAppColors } from './src/theme'

type RootStackParamList = { SignIn: undefined; Workspace: undefined; Conversation: { id: string; title: string } }
type TabsParamList = { Chats: undefined; Updates: undefined; Lists: undefined; Send: undefined; History: undefined; Profile: undefined }
const Stack = createNativeStackNavigator<RootStackParamList>()
const Tabs = createBottomTabNavigator<TabsParamList>()
const navigationRef = createNavigationContainerRef<RootStackParamList>()
const TOKEN_KEY = 'nexusos.session-token'
const EXPO_PUSH_TOKEN_KEY = 'nexusos.expo-push-token'
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: true, shouldShowBanner: true, shouldShowList: true }) })
WebBrowser.maybeCompleteAuthSession()

function useSession() {
  const [session, setSession] = useState<{ token: string; user: User; invite_connection?: Session['invite_connection'] } | null>(null)
  const [restoring, setRestoring] = useState(true)
  useEffect(() => {
    if (!session || !Device.isDevice) return
    void (async () => {
      const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId
      if (!projectId) return
      try {
        if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('messages', { name: 'Messages', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 180, 90, 180], lightColor: '#245BFF' })
        let permission = await Notifications.getPermissionsAsync()
        if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync()
        if (permission.status !== 'granted') return
        const result = await Notifications.getExpoPushTokenAsync({ projectId })
        await api.registerPushToken(session.token, result.data, Device.modelId || Platform.OS)
        await SecureStore.setItemAsync(EXPO_PUSH_TOKEN_KEY, result.data)
      } catch { /* Push setup can be retried when the user changes notification access. */ }
    })()
  }, [session?.token])
  useEffect(() => {
    void (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY)
        if (token) {
          const result = await api.restore(token)
          setSession({ token, user: result.data })
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
      } finally { setRestoring(false) }
    })()
  }, [])
  const accept = async (result: Session) => {
    await SecureStore.setItemAsync(TOKEN_KEY, result.token)
    setSession({ token: result.token, user: result.data, invite_connection: result.invite_connection })
  }
  const signOut = async () => {
    if (session) {
      const pushToken = await SecureStore.getItemAsync(EXPO_PUSH_TOKEN_KEY)
      if (pushToken) await api.removePushToken(session.token, pushToken).catch(() => undefined)
      await api.logout(session.token).catch(() => undefined)
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(EXPO_PUSH_TOKEN_KEY)
    setSession(null)
  }
  return { session, restoring, accept, signOut }
}

function SignInScreen({ onAuthenticated, pendingInviteToken }: { onAuthenticated: (value: Session) => Promise<void>; pendingInviteToken?: string }) {
  const c = useAppColors()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || ''
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || ''
  const googleReady = Boolean(webClientId && androidClientId && iosClientId)
  const [googleRequest, googleResponse, promptGoogle] = Google.useIdTokenAuthRequest({
    webClientId: webClientId || 'google-not-configured',
    androidClientId: androidClientId || 'google-not-configured',
    iosClientId: iosClientId || 'google-not-configured',
    scopes: ['openid', 'profile', 'email'],
  }, { scheme: 'nexusos' })
  useEffect(() => {
    if (googleResponse?.type !== 'success') return
    const idToken = googleResponse.params.id_token
    if (!idToken) { setError('Google did not return an identity token.'); return }
    void (async () => {
      setBusy(true); setError('')
      try { await onAuthenticated(await api.googleLogin(idToken, pendingInviteToken)) }
      catch (e) { setError(e instanceof Error ? e.message : 'Google sign-in failed.') }
      finally { setBusy(false) }
    })()
  }, [googleResponse])
  const submit = async () => {
    setError('')
    if (!email.trim() || !password || (mode === 'register' && !name.trim())) { setError('Complete each field to continue.'); return }
    setBusy(true)
    try {
      await Haptics.selectionAsync()
      const result = mode === 'login' ? await api.login(email.trim(), password) : await api.register(name.trim(), email.trim(), password)
      await onAuthenticated(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.') }
    finally { setBusy(false) }
  }
  return <Page><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}><BrandMark size={48}/><View><Text style={[styles.brandTitle, { color: c.text }]}>NexusOS</Text><Text style={[styles.brandSub, { color: c.muted }]}>Conversations that keep business moving</Text></View></View>
      <View style={[styles.authPanel, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.eyebrow, { color: c.accent }]}>{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</Text>
        <Text style={[styles.authTitle, { color: c.text }]}>{mode === 'login' ? 'Sign in to your workspace' : 'Create your customer account'}</Text>
        <Text style={[styles.authDescription, { color: c.muted }]}>{mode === 'login' ? 'Pick up your conversations right where you left them.' : 'Join a business on NexusOS and keep the conversation in one place.'}</Text>
        <View style={{ gap: 17, marginTop: 25 }}>
          {mode === 'register' && <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" autoCapitalize="words"/>}
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address"/>
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry/>
        </View>
        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        <View style={{ marginTop: 22 }}><PrimaryButton title={mode === 'login' ? 'Sign in' : 'Create account'} onPress={() => void submit()} loading={busy}/></View>
        {mode === 'login' ? <>
          <View style={styles.orRow}><View style={[styles.orLine, { backgroundColor: c.border }]}/><Text style={{ color: c.muted, fontSize: 12 }}>OR</Text><View style={[styles.orLine, { backgroundColor: c.border }]}/></View>
          <Pressable disabled={!googleReady || !googleRequest || busy} onPress={() => void promptGoogle()} style={[styles.googleButton, { backgroundColor: c.surface, borderColor: c.border, opacity: googleReady && googleRequest ? 1 : 0.55 }]}><Text style={[styles.googleGlyph, { color: c.text }]}>G</Text><Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>Continue with Google</Text></Pressable>
          {!googleReady ? <Text style={[styles.googleHint, { color: c.muted }]}>Google sign-in needs platform OAuth client IDs in mobile/.env.</Text> : null}
        </> : null}
        <Pressable onPress={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login') }} style={styles.switchMode}>
          <Text style={{ color: c.muted, fontSize: 14 }}>{mode === 'login' ? "New to NexusOS? " : 'Already have an account? '}<Text style={{ color: c.accent, fontWeight: '700' }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Text></Text>
        </Pressable>
        <Text style={[styles.businessNote, { color: c.muted }]}>Business workspaces are provisioned by a NexusOS administrator. Sign in with your business account credentials.</Text>
      </View>
    </ScrollView>
  </KeyboardAvoidingView></Page>
}

function tabIcon(name: keyof TabsParamList, color: string, size: number) {
  const props = { color, size, strokeWidth: 2 }
  if (name === 'Chats') return <MessageCircle {...props}/>
  if (name === 'Updates') return <Bell {...props}/>
  if (name === 'Lists') return <ListChecks {...props}/>
  if (name === 'Send') return <Send {...props}/>
  if (name === 'History') return <Archive {...props}/>
  return <Settings2 {...props}/>
}

function WorkspaceTabs({ token, user, onSignOut }: { token: string; user: User; onSignOut: () => Promise<void> }) {
  const c = useAppColors()
  const business = user.account_kind === 'business'
  return <Tabs.Navigator screenOptions={{
    headerShown: false, tabBarActiveTintColor: c.accent, tabBarInactiveTintColor: c.muted,
    tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 67, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 26 : 8, backgroundColor: c.surface, borderTopColor: c.border },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }, sceneStyle: { backgroundColor: c.background },
  }}>
    <Tabs.Screen name="Chats" options={{ tabBarIcon: ({ color, size }) => tabIcon('Chats', color, size), tabBarBadge: undefined }}>
      {() => <ChatsScreen token={token} user={user}/>}
    </Tabs.Screen>
    {business ? <>
      <Tabs.Screen name="Lists" options={{ tabBarIcon: ({ color, size }) => tabIcon('Lists', color, size) }}>{() => <BroadcastListsScreen token={token}/>}</Tabs.Screen>
      <Tabs.Screen name="Send" options={{ tabBarIcon: ({ color, size }) => tabIcon('Send', color, size) }}>{() => <NewBroadcastScreen token={token}/>}</Tabs.Screen>
      <Tabs.Screen name="History" options={{ tabBarIcon: ({ color, size }) => tabIcon('History', color, size) }}>{() => <BroadcastFeedScreen token={token} business/>}</Tabs.Screen>
    </> : <Tabs.Screen name="Updates" options={{ tabBarIcon: ({ color, size }) => tabIcon('Updates', color, size) }}>{() => <BroadcastFeedScreen token={token} business={false}/>}</Tabs.Screen>}
    <Tabs.Screen name="Profile" options={{ tabBarIcon: ({ color, size }) => tabIcon('Profile', color, size) }}>{() => <ProfileScreen token={token} user={user} onSignOut={onSignOut}/>}</Tabs.Screen>
  </Tabs.Navigator>
}

function ChatsScreen({ token, user }: { token: string; user: User }) {
  const c = useAppColors()
  const isFocused = useIsFocused()
  const navigation = useNavigation<any>()
  const [chats, setChats] = useState<Conversation[]>([])
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Archived'>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const refresh = async () => { try { setError(''); setChats(await api.conversations(token)) } catch (e) { setError(e instanceof Error ? e.message : 'Could not load chats.') } finally { setLoading(false) } }
  useEffect(() => { if (!isFocused) return; void refresh(); const s = io(API_ORIGIN, { auth: { token }, transports: ['websocket', 'polling'] }); s.on('conversation:updated', () => { void refresh() }); s.on('connect', () => { void refresh() }); return () => { s.disconnect() } }, [token, isFocused])
  const visible = useMemo(() => chats.filter(chat => {
    if (filter === 'Unread' && !chat.unreadCount) return false
    if (filter === 'Archived' && !chat.archived) return false
    if (filter === 'All' && chat.archived) return false
    return `${chat.counterpart.name} ${chat.counterpart.username} ${chat.lastMessage?.body ?? ''}`.toLowerCase().includes(query.toLowerCase())
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned)), [chats, filter, query])
  const setState = async (chat: Conversation, key: 'archived' | 'muted' | 'pinned') => {
    await Haptics.selectionAsync()
    const state = { [key]: !chat[key] }
    setChats(prev => prev.map(item => item.id === chat.id ? { ...item, ...state } : item))
    try { await api.setConversationState(token, chat.id, state) } catch { await refresh() }
  }
  const retry = () => { setLoading(true); void refresh() }
  return <Page><View style={styles.screenHeader}><View style={styles.headerLine}><View><Text style={[styles.screenEyebrow, { color: c.accent }]}>NEXUSOS</Text><Text style={[styles.screenTitle, { color: c.text }]}>Chats</Text></View><Pressable onPress={() => { setFilter('Unread'); void Haptics.selectionAsync() }} style={[styles.countButton, { backgroundColor: c.surfaceAlt }]}><Inbox size={18} color={c.muted}/><Text style={[styles.countText, { color: c.text }]}>{chats.reduce((sum, chat) => sum + chat.unreadCount, 0)}</Text></Pressable></View>
    <View style={[styles.searchBox, { backgroundColor: c.surface, borderColor: c.border }]}><MessageCircle size={17} color={c.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search chats" placeholderTextColor={c.muted} style={[styles.searchInput, { color: c.text }]}/>{query ? <Pressable onPress={() => setQuery('')}><X size={17} color={c.muted}/></Pressable> : null}</View>
    <View style={styles.filters}>{(['All', 'Unread', 'Archived'] as const).map(item => <Pressable key={item} onPress={() => { setFilter(item); void Haptics.selectionAsync() }} style={[styles.filter, { backgroundColor: filter === item ? c.accent : c.surface, borderColor: filter === item ? c.accent : c.border }]}><Text style={{ color: filter === item ? '#fff' : c.muted, fontWeight: '600', fontSize: 13 }}>{item}</Text></Pressable>)}</View>
  </View>
  {loading ? <View style={styles.center}><ActivityIndicator color={c.accent}/></View> : error ? <EmptyState icon={<CircleHelp size={25} color={c.muted}/>} title="Chats couldn't load" detail={error} action={<Pressable onPress={retry} style={{ padding: 14 }}><Text style={{ color: c.accent, fontWeight: '700' }}>Try again</Text></Pressable>}/> : visible.length === 0 ? <EmptyState icon={<MessageCircle size={25} color={c.muted}/>} title={filter === 'Unread' ? 'All caught up' : 'No chats yet'} detail={filter === 'Unread' ? 'Unread conversations will show up here.' : query ? 'Try a different name or message.' : 'When you connect with a business or customer, your conversations will appear here.'}/> :
    <FlatList data={visible} keyExtractor={item => item.id} contentContainerStyle={styles.chatList} ItemSeparatorComponent={() => <View style={{ height: 4 }}/>} renderItem={({ item }) => <ChatRow chat={item} colors={c} onPress={() => { void Haptics.selectionAsync(); navigation.getParent()?.navigate('Conversation', { id: item.id, title: item.counterpart.name }) }} onAction={key => void setState(item, key)}/>}/>
  }</Page>
}

function ChatRow({ chat, colors: c, onPress, onAction }: { chat: Conversation; colors: ReturnType<typeof useAppColors>; onPress: () => void; onAction: (key: 'archived' | 'muted' | 'pinned') => void }) {
  const [menu, setMenu] = useState(false)
  const preview = chat.lastMessage?.body || (chat.lastMessage?.imageUrls?.length ? 'Photo' : chat.lastMessage?.audioUrl ? 'Voice message' : 'Start a conversation')
  return <Pressable onPress={onPress} onLongPress={() => setMenu(v => !v)} style={({ pressed }) => [styles.chatRow, { backgroundColor: pressed ? c.surfaceAlt : c.surface }]}>
    <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Text style={[styles.avatarText, { color: c.accent }]}>{chat.counterpart.name.split(/\s+/u).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</Text></View>
    <View style={{ flex: 1, minWidth: 0 }}><View style={styles.rowHead}><Text numberOfLines={1} style={[styles.chatName, { color: c.text }]}>{chat.counterpart.name}</Text>{chat.pinned ? <Text style={{ color: c.muted, fontSize: 12 }}>Pinned</Text> : null}</View>
      <Text numberOfLines={1} style={[styles.chatPreview, { color: chat.unreadCount ? c.text : c.muted, fontWeight: chat.unreadCount ? '600' : '400' }]}>{preview}</Text>
      {menu ? <View style={[styles.quickActions, { backgroundColor: c.surfaceAlt }]}>{(['pinned', 'muted', 'archived'] as const).map(key => <Pressable key={key} onPress={() => { onAction(key); setMenu(false) }} style={{ paddingVertical: 8, paddingRight: 12 }}><Text style={{ color: c.accent, fontSize: 12, fontWeight: '700' }}>{key === 'pinned' ? chat.pinned ? 'Unpin' : 'Pin' : key === 'muted' ? chat.muted ? 'Unmute' : 'Mute' : 'Archive'}</Text></Pressable>)}</View> : null}
    </View>
    <View style={styles.rowMeta}>{chat.unreadCount > 0 ? <View style={[styles.unreadBadge, { backgroundColor: c.accent }]}><Text style={styles.unreadText}>{chat.unreadCount}</Text></View> : <Pressable hitSlop={8} onPress={() => setMenu(v => !v)}><MoreVertical size={19} color={c.muted}/></Pressable>}</View>
  </Pressable>
}

function ConversationScreen({ token, user }: { token: string; user: User }) {
  const c = useAppColors()
  const navigation = useNavigation<any>()
  const route = useRoute<any>() as { key: string; name: string; params: { id: string; title: string } }
  const { id } = route.params
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(recorder)
  const load = async () => { try { setError(''); setDetail(await api.conversation(token, id)) } catch (e) { setError(e instanceof Error ? e.message : 'Could not load this conversation.') } finally { setBusy(false) } }
  useEffect(() => { setBusy(true); void load(); const s = io(API_ORIGIN, { auth: { token }, transports: ['websocket', 'polling'] }); s.on('conversation:updated', (payload: { conversationId?: string; message?: Message }) => { if (payload.conversationId === id) { if (payload.message) setDetail(prev => prev ? { ...prev, messages: [...prev.messages.filter(m => m.id !== payload.message?.id), payload.message!] } : prev); else void load() } }); return () => { s.disconnect() } }, [token, id])
  const send = async () => {
    const body = draft.trim(); if ((!body && !selectedImage && !recordedAudio) || sending) return
    setSending(true); setDraft(''); void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const localImage = selectedImage
    const localAudio = recordedAudio
    const temporary: Message = { id: `local-${Date.now()}`, conversationId: id, senderId: user.id, body, imageUrls: localImage ? [localImage] : [], audioUrl: localAudio, createdAt: new Date().toISOString(), readAt: null }
    setDetail(prev => prev ? { ...prev, messages: [...prev.messages, temporary] } : prev)
    try { const imageUrls = localImage ? await api.uploadImage(token, localImage) : []; const audioUrl = localAudio ? await api.uploadAudio(token, localAudio) : null; const message = await api.sendContent(token, id, body, imageUrls, audioUrl); setDetail(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === temporary.id ? message : m) } : prev); setSelectedImage(null); setRecordedAudio(null) }
    catch (e) { setDraft(body); setDetail(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== temporary.id) } : prev); setError(e instanceof Error ? e.message : 'Message was not sent.') }
    finally { setSending(false) }
  }
  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { setError('Allow photo access in your device settings to attach an image.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.86 })
    if (!result.canceled && result.assets[0]) { setSelectedImage(result.assets[0].uri); void Haptics.selectionAsync() }
  }
  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop()
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false })
        if (recorder.uri) setRecordedAudio(recorder.uri)
        return
      }
      const permission = await AudioModule.requestRecordingPermissionsAsync()
      if (!permission.granted) { setError('Allow microphone access in device settings to record a voice message.'); return }
      setRecordedAudio(null)
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true })
      await recorder.prepareToRecordAsync()
      recorder.record()
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not record audio.') }
  }
  const messages = detail?.messages ?? []
  return <View style={[styles.conversationPage, { backgroundColor: c.background }]}>
    <View style={[styles.conversationHeader, { backgroundColor: c.surface, borderColor: c.border }]}><Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}><ChevronLeft color={c.text} size={23}/></Pressable>
      <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}><Text style={[styles.avatarText, { color: c.accent }]}>{route.params.title.split(/\s+/u).slice(0, 2).map(p => p[0]).join('').toUpperCase()}</Text></View>
      <View style={{ flex: 1 }}><Text numberOfLines={1} style={[styles.chatName, { color: c.text }]}>{detail?.counterpart.name || route.params.title}</Text><Text style={[styles.chatPreview, { color: c.muted }]}>{detail?.conversation.status === 'pending' ? 'Invitation pending' : 'NexusOS conversation'}</Text></View>
    </View>
    {busy ? <View style={styles.center}><ActivityIndicator color={c.accent}/></View> : error && !detail ? <EmptyState icon={<CircleHelp size={25} color={c.muted}/>} title="Conversation unavailable" detail={error} action={<Pressable onPress={() => { setBusy(true); void load() }} style={{ padding: 14 }}><Text style={{ color: c.accent, fontWeight: '700' }}>Retry</Text></Pressable>}/> : <FlatList inverted data={[...messages].reverse()} keyExtractor={item => item.id} contentContainerStyle={styles.messageList} keyboardShouldPersistTaps="handled" renderItem={({ item }) => {
      const own = item.senderId === user.id
      return <View style={[styles.messageLine, { justifyContent: own ? 'flex-end' : 'flex-start' }]}><View style={[styles.bubble, { backgroundColor: own ? c.outgoing : c.surface, borderColor: c.border, borderBottomRightRadius: own ? 5 : 19, borderBottomLeftRadius: own ? 19 : 5 }]}>
        {item.deletedAt ? <Text style={[styles.messageBody, { color: c.muted, fontStyle: 'italic' }]}>Message deleted</Text> : null}
        {!item.deletedAt && item.imageUrls?.map((url, index) => <Pressable key={`${item.id}-${index}`} onPress={() => setImagePreview(url.startsWith('/') ? `${API_ORIGIN}${url}` : url)}><Image source={{ uri: url.startsWith('/') ? `${API_ORIGIN}${url}` : url }} resizeMode="cover" style={styles.messageImage}/></Pressable>)}
        {!item.deletedAt && item.body ? <Text style={[styles.messageBody, { color: c.text }]}>{item.body}</Text> : null}
        {!item.deletedAt && item.audioUrl ? <AudioBubble url={item.audioUrl} colors={c}/> : null}
        <View style={styles.messageMeta}><Text style={[styles.timeText, { color: c.muted }]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>{own ? (item.readAt ? <CheckCheck color={c.accent} size={14}/> : <Check color={c.muted} size={14}/>) : null}</View>
      </View></View>
    }}/>
    }
    {error && detail ? <Text style={[styles.inlineError, { color: c.danger }]}>{error}</Text> : null}
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      {selectedImage || recordedAudio ? <View style={styles.attachmentRow}>{selectedImage ? <Image source={{ uri: selectedImage }} style={styles.attachmentThumb}/> : <Mic size={20} color={c.accent}/>}<Text style={[styles.attachmentLabel, { color: c.muted }]}>{selectedImage ? 'Photo attached' : 'Voice message ready'}</Text><Pressable onPress={() => { setSelectedImage(null); setRecordedAudio(null) }} hitSlop={8}><X size={18} color={c.muted}/></Pressable></View> : null}
      <View style={[styles.composer, { backgroundColor: c.surface, borderColor: c.border }]}><Pressable onPress={() => void chooseImage()} accessibilityLabel="Attach photo" style={styles.attachButton}><ImagePlus size={20} color={c.muted}/></Pressable><TextInput value={draft} onChangeText={setDraft} placeholder={recorderState.isRecording ? 'Recording voice message…' : 'Message'} placeholderTextColor={c.muted} editable={!recorderState.isRecording} multiline maxLength={4000} style={[styles.composerInput, { color: c.text, backgroundColor: c.surfaceAlt }]} onSubmitEditing={() => void send()} blurOnSubmit={false}/>
        {!draft.trim() && !selectedImage && !recordedAudio ? <Pressable onPress={() => void toggleRecording()} accessibilityLabel={recorderState.isRecording ? 'Stop recording' : 'Record voice message'} style={[styles.sendButton, { backgroundColor: recorderState.isRecording ? c.danger : c.surfaceAlt }]}>{recorderState.isRecording ? <Square size={17} color="#fff" fill="#fff"/> : <Mic size={19} color={c.muted}/>}</Pressable> : null}
        <Pressable onPress={() => void send()} disabled={(!draft.trim() && !selectedImage && !recordedAudio) || sending || recorderState.isRecording} style={[styles.sendButton, { backgroundColor: draft.trim() || selectedImage || recordedAudio ? c.accent : c.surfaceAlt }]}>{sending ? <ActivityIndicator color="#fff" size="small"/> : <Send size={19} color={draft.trim() || selectedImage || recordedAudio ? '#fff' : c.muted}/>}</Pressable>
      </View>
    </KeyboardAvoidingView>
    <Modal visible={!!imagePreview} transparent animationType="fade" onRequestClose={() => setImagePreview(null)}><View style={styles.imageModal}><Pressable style={styles.imageClose} onPress={() => setImagePreview(null)}><X size={24} color="#fff"/></Pressable>{imagePreview ? <Image source={{ uri: imagePreview }} resizeMode="contain" style={styles.imageFull}/> : null}</View></Modal>
  </View>
}

function AudioBubble({ url, colors: c }: { url: string; colors: ReturnType<typeof useAppColors> }) {
  const source = url.startsWith('/') ? `${API_ORIGIN}${url}` : url
  const player = useAudioPlayer(source, { updateInterval: 400 })
  const status = useAudioPlayerStatus(player)
  const format = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  return <View style={styles.audioRow}><Pressable onPress={() => status.playing ? player.pause() : player.play()} style={[styles.audioPlay, { backgroundColor: c.accentSoft }]}>{status.playing ? <Pause size={17} color={c.accent}/> : <Play size={17} color={c.accent} fill={c.accent}/>}</Pressable><View style={{ flex: 1 }}><View style={[styles.audioTrack, { backgroundColor: c.border }]}><View style={[styles.audioProgress, { backgroundColor: c.accent, width: `${status.duration ? Math.min(100, status.currentTime / status.duration * 100) : 0}%` }]}/></View><Text style={[styles.audioTime, { color: c.muted }]}>{format(status.currentTime)} / {format(status.duration)}</Text></View></View>
}

function ProfileScreen({ token, user, onSignOut }: { token: string; user: User; onSignOut: () => Promise<void> }) {
  const c = useAppColors()
  const [working, setWorking] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [settings, setSettings] = useState<import('./src/api').ProfileSettings | null>(null)
  const [notice, setNotice] = useState('')
  const [permission, setPermission] = useState('Checking…')
  useEffect(() => {
    let active = true
    void Promise.all([api.profile(token), user.account_kind === 'business' ? api.businessInvite(token) : Promise.resolve(null)]).then(([profile, invite]) => {
      if (!active) return
      setSettings(profile.settings)
      setInviteUrl(invite?.inviteUrl || '')
    }).catch(e => { if (active) setNotice(e instanceof Error ? e.message : 'Could not load profile settings.') })
    void Notifications.getPermissionsAsync().then(value => { if (active) setPermission(value.granted ? 'Allowed on this device' : 'Permission not granted') }).catch(() => { if (active) setPermission('Unavailable') })
    return () => { active = false }
  }, [token, user.account_kind])
  const changeNotifications = async () => {
    const value = await Notifications.requestPermissionsAsync()
    setPermission(value.granted ? 'Allowed on this device' : 'Permission not granted')
    if (value.granted) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }
  const saveSettings = async () => {
    if (!settings) return
    if (!/^([01]\d|2[0-3]):[0-5]\d$/u.test(settings.quietHoursStart) || !/^([01]\d|2[0-3]):[0-5]\d$/u.test(settings.quietHoursEnd)) { setNotice('Quiet hours must use 24-hour HH:MM format.'); return }
    setWorking(true); setNotice('')
    try { await api.saveProfileSettings(token, user, settings); setNotice('Settings saved.') }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Could not save settings.') }
    finally { setWorking(false) }
  }
  const regenerate = async () => {
    setWorking(true); setNotice('')
    try { const value = await api.regenerateBusinessInvite(token); setInviteUrl(value.inviteUrl); setNotice('A new invite link is ready.') }
    catch (e) { setNotice(e instanceof Error ? e.message : 'Could not regenerate invite link.') }
    finally { setWorking(false) }
  }
  const changeSetting = (patch: Partial<NonNullable<typeof settings>>) => setSettings(prev => prev ? { ...prev, ...patch } : prev)
  return <Page><ScrollView contentContainerStyle={{ paddingBottom: 30 }}><View style={styles.screenHeader}><Text style={[styles.screenEyebrow, { color: c.accent }]}>ACCOUNT</Text><Text style={[styles.screenTitle, { color: c.text }]}>Profile</Text></View>
    <View style={[styles.profileCard, { backgroundColor: c.surface, borderColor: c.border }]}><View style={[styles.profileAvatar, { backgroundColor: c.accentSoft }]}><Text style={[styles.avatarText, { color: c.accent }]}>{user.name.split(/\s+/u).slice(0, 2).map(p => p[0]).join('').toUpperCase()}</Text></View><Text style={[styles.profileName, { color: c.text }]}>{user.name}</Text><Text style={[styles.chatPreview, { color: c.muted }]}>{user.email || user.username}</Text><View style={[styles.rolePill, { backgroundColor: c.surfaceAlt }]}><Text style={{ color: c.muted, fontSize: 12, fontWeight: '700' }}>{user.account_kind === 'business' ? 'BUSINESS WORKSPACE' : 'CUSTOMER ACCOUNT'}</Text></View></View>
    {notice ? <Text style={[styles.profileNotice, { color: notice.includes('saved') || notice.includes('ready') ? c.success : c.danger }]}>{notice}</Text> : null}
    {user.account_kind === 'business' ? <View style={[styles.settingsCard, { backgroundColor: c.surface, borderColor: c.border }]}><View style={styles.profileHeading}><Users size={18} color={c.accent}/><Text style={[styles.sectionHeading, { color: c.text }]}>CUSTOMER INVITE LINK</Text></View><Text selectable style={[styles.inviteText, { color: c.muted }]}>{inviteUrl || 'Loading invite link…'}</Text><View style={styles.profileActions}><Pressable disabled={!inviteUrl} onPress={() => void Share.share({ message: inviteUrl })} style={[styles.smallAction, { backgroundColor: c.accent }]}><Text style={styles.smallActionText}>Share link</Text></Pressable><Pressable onPress={() => void regenerate()} style={[styles.smallAction, { backgroundColor: c.surfaceAlt }]}><Text style={[styles.smallActionText, { color: c.text }]}>{working ? 'Please wait…' : 'Regenerate'}</Text></Pressable></View></View> : null}
    <View style={[styles.settingsCard, { backgroundColor: c.surface, borderColor: c.border }]}><View style={styles.profileHeading}><Bell size={18} color={c.accent}/><Text style={[styles.sectionHeading, { color: c.text }]}>NOTIFICATIONS</Text></View><View style={styles.settingLine}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: c.text }]}>Device permission</Text><Text style={[styles.chatPreview, { color: c.muted }]}>{permission}</Text></View><Pressable onPress={() => void changeNotifications()}><Text style={{ color: c.accent, fontWeight: '700' }}>Allow</Text></Pressable></View>
      {settings ? <><View style={[styles.settingDivider, { backgroundColor: c.border }]}/><View style={styles.settingLine}><View style={{ flex: 1 }}><Text style={[styles.settingTitle, { color: c.text }]}>Quiet hours</Text><Text style={[styles.chatPreview, { color: c.muted }]}>Pause message alerts on a schedule</Text></View><Pressable onPress={() => changeSetting({ quietHoursEnabled: !settings.quietHoursEnabled })} style={[styles.toggle, { backgroundColor: settings.quietHoursEnabled ? c.accent : c.surfaceAlt }]}><View style={[styles.toggleThumb, { alignSelf: settings.quietHoursEnabled ? 'flex-end' : 'flex-start', backgroundColor: c.surface }]}/></Pressable></View>
        {settings.quietHoursEnabled ? <View style={styles.timeFields}><TextInput value={settings.quietHoursStart} onChangeText={quietHoursStart => changeSetting({ quietHoursStart })} placeholder="22:00" placeholderTextColor={c.muted} style={[styles.timeInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}/><Text style={{ color: c.muted }}>to</Text><TextInput value={settings.quietHoursEnd} onChangeText={quietHoursEnd => changeSetting({ quietHoursEnd })} placeholder="08:00" placeholderTextColor={c.muted} style={[styles.timeInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}/></View> : null}
        <View style={[styles.settingDivider, { backgroundColor: c.border }]}/><View style={styles.settingLine}><Text style={[styles.settingTitle, { color: c.text, flex: 1 }]}>Read receipts</Text><Pressable onPress={() => changeSetting({ allowReadReceipts: !settings.allowReadReceipts })} style={[styles.toggle, { backgroundColor: settings.allowReadReceipts ? c.accent : c.surfaceAlt }]}><View style={[styles.toggleThumb, { alignSelf: settings.allowReadReceipts ? 'flex-end' : 'flex-start', backgroundColor: c.surface }]}/></Pressable></View>
        <PrimaryButton title={working ? 'Saving…' : 'Save settings'} loading={working} onPress={() => void saveSettings()}/></> : <ActivityIndicator color={c.accent}/>}
    </View>
    <Pressable onPress={async () => { setWorking(true); await onSignOut(); setWorking(false) }} style={[styles.signOutButton, { backgroundColor: c.surface, borderColor: c.border }]}><LogOut size={18} color={c.danger}/><Text style={{ color: c.danger, fontWeight: '700', fontSize: 14 }}>{working ? 'Signing out…' : 'Sign out'}</Text></Pressable>
    <Text style={[styles.version, { color: c.muted }]}>NexusOS Mobile · Early access</Text>
  </ScrollView></Page>
}

function AppShell() {
  const c = useAppColors()
  const { session, restoring, accept, signOut } = useSession()
  const [pendingInviteToken, setPendingInviteToken] = useState<string>()
  const [pendingConversation, setPendingConversation] = useState<{ id: string; title?: string }>()
  const [navReady, setNavReady] = useState(false)
  const linking = useMemo(() => ({ prefixes: ['nexusos://', 'https://nexusos.sparkpair.dev'], config: { screens: { Conversation: 'chat/:id' } } }), [])
  useEffect(() => {
    const readUrl = (url: string | null) => {
      const match = url?.match(/(?:\/join\/|^nexusos:\/\/join\/)([^/?#]+)/u)
      if (match?.[1]) setPendingInviteToken(decodeURIComponent(match[1]))
    }
    void Linking.getInitialURL().then(readUrl)
    const subscription = Linking.addEventListener('url', event => readUrl(event.url))
    return () => subscription.remove()
  }, [])
  useEffect(() => {
    const openFromResponse = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url
      if (typeof url !== 'string') return
      const match = url.match(/\/chats\/([0-9a-f-]{36})(?:[/?#]|$)/iu)
      if (match?.[1]) setPendingConversation({ id: match[1] })
    }
    void Notifications.getLastNotificationResponseAsync().then(openFromResponse)
    const subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse)
    return () => subscription.remove()
  }, [])
  useEffect(() => {
    if (!session || !pendingInviteToken || !navReady) return
    const inviteToken = pendingInviteToken
    setPendingInviteToken(undefined)
    void (async () => {
      try {
        const linked = session.invite_connection
          ? { connection: session.invite_connection.connection, business: session.invite_connection.business }
          : await api.connectInvite(session.token, inviteToken)
        navigationRef.navigate('Conversation', { id: linked.connection.id, title: linked.business.name })
      } catch (e) {
        navigationRef.navigate('Workspace')
        Alert.alert('Invite unavailable', e instanceof Error ? e.message : 'This invite could not be connected.')
      }
    })()
  }, [session?.token, pendingInviteToken, navReady])
  useEffect(() => {
    if (!session || !pendingConversation || !navReady) return
    const target = pendingConversation
    setPendingConversation(undefined)
    void api.conversations(session.token).then(chats => {
      const conversation = chats.find(item => item.id === target.id)
      navigationRef.navigate('Conversation', { id: target.id, title: conversation?.counterpart.name || target.title || 'Conversation' })
    }).catch(() => navigationRef.navigate('Workspace'))
  }, [session?.token, pendingConversation, navReady])
  if (restoring) return <Page><View style={styles.center}><BrandMark/><ActivityIndicator color={c.accent} style={{ marginTop: 18 }}/></View></Page>
  return <NavigationContainer ref={navigationRef} onReady={() => setNavReady(true)} linking={linking} theme={{ dark: c.background === '#090B0F', colors: { primary: c.accent, background: c.background, card: c.surface, text: c.text, border: c.border, notification: c.accent } } as any}>
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background }, animation: 'slide_from_right' }}>
      {!session ? <Stack.Screen name="SignIn">{() => <SignInScreen onAuthenticated={accept} pendingInviteToken={pendingInviteToken}/>}</Stack.Screen> : <>
        <Stack.Screen name="Workspace">{() => <WorkspaceTabs token={session.token} user={session.user} onSignOut={signOut}/>}</Stack.Screen>
        <Stack.Screen name="Conversation" options={{ animation: 'slide_from_right' }}>{() => <ConversationScreen token={session.token} user={session.user}/>}</Stack.Screen>
      </>}
    </Stack.Navigator>
  </NavigationContainer>
}

export default function App() { return <AppShell/> }

const styles = StyleSheet.create({
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 50, paddingBottom: 40 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 }, brandTitle: { fontSize: 22, fontWeight: '800' }, brandSub: { fontSize: 12, marginTop: 3 }, authPanel: { borderWidth: 1, borderRadius: 24, padding: 22 }, eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3 }, authTitle: { fontSize: 25, fontWeight: '700', lineHeight: 31, marginTop: 9 }, authDescription: { fontSize: 14, lineHeight: 21, marginTop: 8 }, error: { fontSize: 13, lineHeight: 19, marginTop: 14 }, orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 }, orLine: { height: StyleSheet.hairlineWidth, flex: 1 }, googleButton: { height: 50, borderWidth: 1, borderRadius: 15, flexDirection: 'row', gap: 12, alignItems: 'center', justifyContent: 'center' }, googleGlyph: { fontSize: 17, fontWeight: '800' }, googleHint: { textAlign: 'center', fontSize: 11, marginTop: 8 }, switchMode: { alignItems: 'center', paddingVertical: 20 }, businessNote: { fontSize: 12, lineHeight: 18, textAlign: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#8883', paddingTop: 15 },
  screenHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }, screenEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, screenTitle: { fontSize: 26, fontWeight: '700', marginTop: 5 }, headerLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, countButton: { minWidth: 52, height: 38, paddingHorizontal: 10, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, countText: { fontWeight: '700', fontSize: 13 },
  searchBox: { height: 46, marginTop: 15, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, fontSize: 14, height: '100%' }, filters: { flexDirection: 'row', gap: 8, paddingTop: 12 }, filter: { borderWidth: 1, paddingHorizontal: 15, height: 34, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  chatList: { paddingHorizontal: 10, paddingBottom: 20 }, chatRow: { minHeight: 76, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, gap: 12 }, avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 13, fontWeight: '700' }, rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, chatName: { fontSize: 15, fontWeight: '700', flexShrink: 1 }, chatPreview: { fontSize: 12, marginTop: 5 }, rowMeta: { minWidth: 26, alignItems: 'center', justifyContent: 'center' }, unreadBadge: { minWidth: 21, height: 21, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' }, quickActions: { flexDirection: 'row', alignSelf: 'flex-start', marginTop: 6, marginBottom: 3, paddingHorizontal: 9, borderRadius: 10 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  conversationPage: { flex: 1 }, conversationHeader: { minHeight: 66, borderWidth: 1, borderRadius: 18, marginHorizontal: 10, marginTop: 8, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }, backButton: { width: 38, height: 42, alignItems: 'center', justifyContent: 'center' }, messageList: { paddingHorizontal: 13, paddingTop: 18, paddingBottom: 15, gap: 8 }, messageLine: { flexDirection: 'row', width: '100%' }, bubble: { maxWidth: '84%', minWidth: 70, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 7 }, messageBody: { fontSize: 15, lineHeight: 21 }, messageImage: { width: 220, height: 220, maxWidth: '100%', borderRadius: 13, marginBottom: 5 }, messageMeta: { flexDirection: 'row', gap: 4, justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 }, timeText: { fontSize: 10 }, audioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180, paddingVertical: 3 }, audioPlay: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, audioTrack: { height: 4, borderRadius: 2, overflow: 'hidden' }, audioProgress: { height: 4, borderRadius: 2 }, audioTime: { marginTop: 5, fontSize: 10 }, composer: { marginHorizontal: 10, marginTop: 7, marginBottom: Platform.OS === 'ios' ? 8 : 10, minHeight: 56, maxHeight: 130, borderWidth: 1, borderRadius: 20, padding: 6, flexDirection: 'row', alignItems: 'flex-end', gap: 7 }, composerInput: { flex: 1, minHeight: 42, maxHeight: 116, borderRadius: 15, paddingHorizontal: 13, paddingTop: 11, paddingBottom: 9, fontSize: 15 }, sendButton: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, attachButton: { width: 39, height: 42, alignItems: 'center', justifyContent: 'center' }, attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16, paddingTop: 8 }, attachmentThumb: { width: 42, height: 42, borderRadius: 10 }, attachmentLabel: { flex: 1, fontSize: 12 }, imageModal: { flex: 1, backgroundColor: '#050608', alignItems: 'center', justifyContent: 'center' }, imageClose: { position: 'absolute', top: 55, right: 18, zIndex: 1, width: 42, height: 42, borderRadius: 21, backgroundColor: '#282B31', alignItems: 'center', justifyContent: 'center' }, imageFull: { width: '100%', height: '80%' }, inlineError: { paddingHorizontal: 16, fontSize: 12, paddingVertical: 4 },
  featureCard: { marginHorizontal: 16, borderWidth: 1, borderRadius: 20, padding: 22, alignItems: 'flex-start' }, featureIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, featureTitle: { fontSize: 18, fontWeight: '700', marginTop: 17 }, featureDesc: { fontSize: 14, lineHeight: 21, marginTop: 6 }, featureFoot: { fontSize: 13, marginTop: 22, fontWeight: '600' }, profileCard: { marginHorizontal: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderRadius: 20 }, profileAvatar: { width: 70, height: 70, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, profileName: { fontSize: 20, fontWeight: '700', marginTop: 12 }, rolePill: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14 }, profileSection: { marginHorizontal: 20, marginTop: 27, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 15, gap: 17 }, sectionHeading: { fontSize: 11, fontWeight: '800', letterSpacing: 1 }, profileRow: { flexDirection: 'row', alignItems: 'center', gap: 11 }, profileRowText: { fontSize: 14, fontWeight: '600', flex: 1 }, signOutButton: { marginHorizontal: 16, marginTop: 24, minHeight: 50, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 }, version: { textAlign: 'center', marginTop: 20, fontSize: 11 },
  profileNotice: { marginHorizontal: 20, marginBottom: 12, fontSize: 13 }, settingsCard: { marginHorizontal: 16, marginTop: 16, padding: 16, gap: 13, borderWidth: 1, borderRadius: 18 }, profileHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 }, inviteText: { fontSize: 12, lineHeight: 18 }, profileActions: { flexDirection: 'row', gap: 9 }, smallAction: { minHeight: 40, flex: 1, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, smallActionText: { color: '#fff', fontSize: 13, fontWeight: '700' }, settingLine: { minHeight: 45, flexDirection: 'row', alignItems: 'center', gap: 12 }, settingTitle: { fontSize: 14, fontWeight: '600' }, settingDivider: { height: StyleSheet.hairlineWidth, marginVertical: 3 }, toggle: { width: 48, height: 28, borderRadius: 15, padding: 3, justifyContent: 'center' }, toggleThumb: { width: 22, height: 22, borderRadius: 11 }, timeFields: { flexDirection: 'row', alignItems: 'center', gap: 10 }, timeInput: { width: 90, height: 42, textAlign: 'center', borderWidth: 1, borderRadius: 11, fontSize: 14 },
})
