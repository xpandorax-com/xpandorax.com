/* eslint-disable no-restricted-exports */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'
export const generateMetadata = ({ params, searchParams }) => generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }) => RootPage({ config, params, searchParams })

export default Page
