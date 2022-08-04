// https://github.com/GoogleChromeLabs/quicklink/blob/master/src/prefetch.mjs
function hasPrefetch(): boolean {
  const link = document.createElement('link');
  return link.relList && link.relList.supports && link.relList.supports('prefetch');
}

function viaDOM(url: string): Promise<void> {
  return new Promise<void>((res, rej) => {
    if (!document.querySelector(`link[rel="prefetch"][href="${url}"][as="fetch"]`)) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'document';
      link.onload = () => res();
      link.onerror = rej;
      link.href = url;

      document.head.appendChild(link);
    } else {
      res();
    }
  });
}

function viaXHR(url: string): Promise<void> {
  return new Promise((res, rej) => {
    const req = new XMLHttpRequest();

    req.withCredentials = true;
    req.open('GET', url, true);

    req.onload = () => {
      if (req.status === 200) {
        res();
      } else {
        rej();
      }
    };

    req.send();
  });
}

async function priority(url: string): Promise<void> {
  // TODO: Investigate using preload for high-priority
  // fetches. May have to sniff file-extension to provide
  // valid 'as' values. In the future, we may be able to
  // use Priority Hints here.
  //
  // As of 2018, fetch() is high-priority in Chrome
  // and medium-priority in Safari.
  if ('fetch' in window) {
    await fetch(url, { credentials: 'include' });
  } else {
    await viaXHR(url);
  }
}

const links = new Set<string>();

export default async function prefetch(url: string, isPriority = false): Promise<void> {
  if (!links.has(url)) {
    links.add(url);
    if (isPriority) {
      await priority(url);
    } else if (hasPrefetch()) {
      try {
        await viaDOM(url);
      } catch (error) {
        await viaXHR(url);
      }
    } else {
      await viaXHR(url);
    }
  }
}
