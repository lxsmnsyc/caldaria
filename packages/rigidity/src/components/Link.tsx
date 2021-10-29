import * as SolidRouter from 'solid-app-router';
import { JSX } from 'solid-js/jsx-runtime';
import Head from './Head';

type ExcludeHrefProps = Omit<JSX.IntrinsicElements['a'], 'href'>;

export interface LinkProps extends ExcludeHrefProps {
  href: string;
  children: JSX.Element;
}

export default function Link(props: LinkProps): JSX.Element {
  return (
    <>
      <Head>
        <link rel="prefetch" href={props.href} as="document" />
      </Head>
      <SolidRouter.Link
        {...props}
      />
    </>
  );
}
