/* eslint-disable no-restricted-exports */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@payload-config'

export const generateMetadata = async ({ params, searchParams }) => {
  return generatePageMetadata({ config, params: await params, searchParams: await searchParams })
}

const Page = async ({ params, searchParams }) => {
  return RootPage({ config, params: await params, searchParams: await searchParams })
}

export default Page
