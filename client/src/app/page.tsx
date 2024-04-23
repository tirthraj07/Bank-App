import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
export default function Home() {
  const cookieStore = cookies()
  const userToken = cookieStore.get('userToken')
  return (
    <>
      {
      cookieStore.has('userToken')?
      <>
        {
        userToken&&userToken['name']&&userToken['value']?
          <>
            {userToken['name']}:{userToken['value']}
          </>:
          <>
            UserToken Undefined
          </>
        }
      </>
      :
        redirect('/login')
      }
    </>
  );
}
