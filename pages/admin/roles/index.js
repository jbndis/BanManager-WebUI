import { AiOutlinePlus } from 'react-icons/ai'
import Link from 'next/link'
import Loader from '../../../components/Loader'
import ErrorLayout from '../../../components/ErrorLayout'
import AdminLayout from '../../../components/AdminLayout'
import RoleItem from '../../../components/admin/RoleItem'
import Button from '../../../components/Button'
import PageHeader from '../../../components/PageHeader'
import PlayersTable from '../../../components/admin/PlayersTable'
import AssignPlayersRoleForm from '../../../components/admin/AssignPlayersRoleForm'
import { useApi } from '../../../utils'

export default function Page () {
  const { loading, data, errors, mutate } = useApi({
    query: `query {
      roles {
        id
        name
      }
      servers {
        id
        name
      }
    }`
  })
  const onDeleted = ({ deleteRole: { id } }) => {
    const roles = data.roles.filter(s => s.id !== id)

    mutate({ ...data, roles }, false)
  }

  if (loading) return <AdminLayout title='Loading...'><Loader /></AdminLayout>
  if (errors || !data) return <ErrorLayout errors={errors} />

  const items = data.roles.map(role => <RoleItem key={role.id} role={role} onDeleted={onDeleted} />)
  const globalRoleMutation = `mutation assignRole($players: [UUID!]!, $role: Int!) {
    assignRole(players: $players, role: $role) {
      id
    }
  }`
  const serverRoleMutation = `mutation assignRole($players: [UUID!]!, $serverId: ID!, $role: Int!) {
    assignServerRole(players: $players, serverId: $serverId, role: $role) {
      id
    }
  }`

  return (
    <AdminLayout title='Roles'>
      <PageHeader title='Roles' />
      <div className='w-24 mb-5'>
        <Link href='/admin/roles/add' passHref>
          <a>
            <Button className='bg-green-600 hover:bg-green-700'><AiOutlinePlus className='text-xl' /> Add</Button>
          </a>
        </Link>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 justify-items-center pb-12 border-b border-accent-200'>
        {items}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 justify-items-center'>
        <div>
          <PageHeader title='Assign Global Player Roles' />
          <p className='mb-6'>Takes priority over server roles, and applies globally</p>
          <AssignPlayersRoleForm roles={data.roles} query={globalRoleMutation} />
        </div>
        <div>
          <PageHeader title='Assign Server Player Roles' />
          <p className='mb-6'>Only affects certain actions where a server is applicable, e.g. bans</p>
          <AssignPlayersRoleForm roles={data.roles} servers={data.servers} query={serverRoleMutation} />
        </div>
      </div>
      <div>
        <PlayersTable roles={data.roles} servers={data.servers} />
      </div>
    </AdminLayout>
  )
}
