import { listContactMessages } from '../../actions'
import { MessagesManager } from './messages-manager'

export default async function AdminMessagesPage() {
  const messages = await listContactMessages()
  return <MessagesManager messages={messages} />
}
