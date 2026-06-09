import { Injectable, type MessageEvent } from '@nestjs/common';
import { Observable, Subject, interval, merge, map, filter } from 'rxjs';

const HEARTBEAT_MS = 25_000;

/** In-memory pub/sub so the website can be pushed extension status changes instantly via SSE. */
@Injectable()
export class ExtensionStatusEvents {
  private readonly changes$ = new Subject<{ userId: string }>();

  /** Called whenever a user's extension connections change (pair, disconnect, disconnect-current). */
  notify(userId: string): void {
    this.changes$.next({ userId });
  }

  /** Per-user stream: status-changed events for that user, plus periodic heartbeats to keep the connection alive. */
  stream(userId: string): Observable<MessageEvent> {
    const statusChanged$ = this.changes$.pipe(
      filter((event) => event.userId === userId),
      map((): MessageEvent => ({ data: { type: 'status-changed' } })),
    );
    const heartbeat$ = interval(HEARTBEAT_MS).pipe(map((): MessageEvent => ({ data: { type: 'ping' } })));
    return merge(statusChanged$, heartbeat$);
  }
}
