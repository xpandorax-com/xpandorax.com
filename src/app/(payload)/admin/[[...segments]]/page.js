/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

export const generateMetadata = (args) => generatePageMetadata({ config, ...args })

export default function Page(props) {
  return <RootPage config={config} {...props} />
}
