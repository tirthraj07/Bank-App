import { CookiesProvider } from 'next-client-cookies/server';
export default function LoginPageLayout({children}:{
    children:React.ReactNode
}){
    return(
    <>
        <CookiesProvider>
        {children}
        </CookiesProvider>
    </>
    )

}