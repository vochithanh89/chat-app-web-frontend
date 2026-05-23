import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hash, Plus } from 'lucide-react'
import { conversationService } from '../services/conversationService'
import { useUserStore } from '../stores/userStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import NewConversationDialog from '../components/NewConversationDialog'

export default function GroupsPage() {
  const navigate = useNavigate()
  const user = useUserStore((state) => state.user)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const loadGroups = async () => {
    setLoading(true)
    setError('')
    try {
      const conversations = await conversationService.list()
      setGroups(conversations.filter((conv) => conv.type === 'group'))
    } catch (err) {
      setError('Không thể tải danh sách nhóm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((group) =>
      group.name?.toLowerCase().includes(q) ||
      group.lastMessagePreview?.toLowerCase().includes(q)
    )
  }, [groups, searchQuery])

  const handleGroupCreated = (conversation) => {
    if (!conversation) return
    setGroups((prev) => [conversation, ...prev])
    setShowCreateDialog(false)
    navigate(`/chat/${conversation.id}`)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Hash className="w-6 h-6" />
            <h1 className="text-3xl font-semibold">Community Groups</h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Quản lý các nhóm cộng đồng, tạo nhóm mới và tiếp cận các cộng đồng xã hội phù hợp với đề tài OTT.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            Create community
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {loading && (
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground">Loading groups...</p>
              </CardContent>
            </Card>
          )}

          {!loading && error && (
            <Card>
              <CardContent>
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredGroups.length === 0 && (
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold">No community groups yet.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a topic-based group to invite members and start sharing media, files, and conversations.
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && filteredGroups.map((group) => (
            <Card key={group.id} className="border-border overflow-hidden">
              <CardHeader className="gap-2">
                <div>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    {group.members?.length ?? 0} members • {group.lastMessagePreview || 'No messages yet.'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Owner: {group.ownerId === user?.id ? 'You' : 'Group admin'}
                    </p>
                    <p>Created by {group.createdBy ? group.createdBy : 'community admin'}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between gap-2">
                <Button variant="secondary" onClick={() => navigate(`/chat/${group.id}`)}>
                  Open chat
                </Button>
                <span className="text-xs text-muted-foreground">
                  Updated {group.lastMessageAt ? new Date(group.lastMessageAt).toLocaleDateString() : 'N/A'}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <NewConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleGroupCreated}
      />
    </div>
  )
}
