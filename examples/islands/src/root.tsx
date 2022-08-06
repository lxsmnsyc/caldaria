/* @jsxImportSource solid-js */
import { Show, Suspense } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
  createRigidityRoot,
  MDXProvider,
} from 'rigidity/root';
import { Link } from 'rigidity/meta';
import styles from './styles/main.css?url';
import example from './styles/example.styl?url';

export default createRigidityRoot({
  App(appProps) {
    return (
      <MDXProvider
        builtins={{
          Heading(props) {
            return (
              <Dynamic component={`h${props.depth}`}>
                {props.children}
              </Dynamic>
            );
          },
          Paragraph(props) {
            return (
              <p>
                {props.children}
              </p>
            );
          },
          Root(props) {
            return (
              <div class="bg-white m-4 p-4 rounded-lg prose">
                {props.children}
              </div>
            );
          },
          Blockquote(props) {
            return (
              <blockquote>
                {props.children}
              </blockquote>
            );
          },
          Image(props) {
            return (
              <img src={props.url} alt={props.alt ?? props.title} />
            );
          },
          Code(props) {
            return (
              <pre lang={props.lang}>
                {props.children}
              </pre>
            );
          },
          InlineCode(props) {
            return (
              <code>{props.children}</code>
            );
          },
          List(props) {
            return (
              <Dynamic component={props.ordered ? 'ol' : 'ul'} start={props.start}>
                {props.children}
              </Dynamic>
            );
          },
          ListItem(props) {
            return (
              <li>
                <Show when={'checked' in props} fallback={props.children}>
                  <input type="checkbox" checked={props.checked} />
                  {props.children}
                </Show>
              </li>
            );
          },
          Link(props) {
            return (
              <a href={props.url} title={props.title}>{props.children}</a>
            );
          },
        }}
      >
        <Link rel="stylesheet" href={styles} />
        <Link rel="stylesheet" href={example} />
        <div class="bg-gradient-to-r from-indigo-400 to-blue-600 w-full flex">
          <div class="flex flex-col items-center w-full min-h-screen overflow-x-hidden">
            <Suspense fallback={<h1>Loading...</h1>}>
              {appProps.children}
            </Suspense>
          </div>
        </div>
      </MDXProvider>
    );
  },
});
