/* @jsxImportSource solid-js */
import { Meta, Title } from 'caldaria/meta';
import { RouterLink, Form } from 'caldaria/router';
import { JSX, Show } from 'solid-js';
import { isServer } from 'solid-js/web';

interface Params {
  id: string;
}

interface HelloProps {
  data: {
    action: string;
  };
  params: Params;
}

function FormExample(props: HelloProps): JSX.Element {
  return (
    <div class="flex w-full h-screen items-center justify-center">
      <div class="p-4 rounded-lg bg-indigo-900 bg-opacity-25 flex flex-col space-y-4">
        <Title>Welcome to Form Example!</Title>
        <Meta name="description" content="This is the page Form Example for Caldaria Demo" />
        <span class="text-2xl text-white font-sans">
          {'Welcome to '}
          <span class="bg-white bg-opacity-25 font-mono p-2 rounded m-1">Form Example</span>
          !
        </span>
        <Form action="example" method="post" class="flex space-x-1">
          <input
            type="text"
            name="message"
            placeholder="Write your message"
            class="px-2 py-1 rounded"
          />
          <button type="submit" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">
            Submit
          </button>
        </Form>
        <Show when={props.data.action}>
          <span class="text-2xl text-white font-sans">
            {props.data.action}
          </span>
        </Show>
        <div class="flex flex-col space-y-1">
          <RouterLink href="/" class="text-white underline bg-white bg-opacity-25 rounded px-2 py-1">Go to home</RouterLink>
        </div>
      </div>
    </div>
  );
}

if (isServer) {
  FormExample.actions = {
    async example(request: Request) {
      const formData = request.method === 'GET'
        ? new URL(request.url).searchParams
        : await request.formData();
      formData.forEach((value, key) => {
        console.log(key, value);
      });
      return new Response(JSON.stringify(`Hello, ${formData.get('message')}!`), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
  };
}

export default FormExample;
