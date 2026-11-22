import { RESOURCE_GROUPS, type ResourceItem } from '../data/resources';
import { en } from '../lib/format';
import { Icon } from '../lib/icons';

function Item({ item }: { item: ResourceItem }) {
  if (item.kind === 'note') {
    return <p style={{ fontSize: 14 }}>{en(item.name)}</p>;
  }
  return (
    <div className="res-item">
      {item.url ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {en(item.name)} <Icon name="external" size={13} />
        </a>
      ) : (
        <b>{en(item.name)}</b>
      )}{' '}
      {item.kind === 'nolink' && <span className="chip">লিংক যাচাই হয়নি</span>}
      {item.kind === 'paid' && <span className="chip danger">PAID</span>}
      {item.note && <div className="note">{en(item.note)}</div>}
    </div>
  );
}

export function ResourcesSection() {
  return (
    <div>
      <h2 className="section-title">রিসোর্স — 101টি লিংক</h2>
      <p className="muted">
        সবকিছু ফ্রি, অথবা PAID লেবেলে দামসহ চিহ্নিত। যাচাই হয়নি এমন জিনিসে লিংক নেই — শুধু নাম আছে।
      </p>
      {RESOURCE_GROUPS.map((g) => {
        let lastSub: string | undefined;
        return (
          <div className="card" key={g.title}>
            <h3>{en(g.title)}</h3>
            {g.note && <p className="muted">{en(g.note)}</p>}
            {g.items.map((item, i) => {
              const subHead = item.sub && item.sub !== lastSub ? item.sub : null;
              lastSub = item.sub;
              return (
                <div key={i}>
                  {subHead && <div className="res-sub">{en(subHead)}</div>}
                  <Item item={item} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
