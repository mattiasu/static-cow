---
title: Svelte, Go, and the Genius AI Moron.
date: 2025-06-29
category: AI
author: Mattias Uhlegård
profileImage: /assets/images/muhlegard-green.jpg
intro: Thought I was building a note-taking app. Ended up debugging the future of software development, with AI as my overly confident junior dev.
tags: AI, Development, Architecture
---

Some months ago, I set out to build a hobby project. For me, it’s good to get back to coding now and then. Not just for fun, but to stay hands-on. I also wanted to personally explore where AI can actually support me. As always, it’s hard to land on a side project with just the right balance of value, learning, and complexity. Eventually, I went with the obvious choice: a note-taking app.

Nothing revolutionary, but that was the point. I wanted a tool to help me think, something small and smart that could interpret messy thoughts, draft smarter reflections, and maybe even surprise me now and then. So I threw in some frameworks and languages I hadn’t used before: Go for the backend, Svelte for the frontend, OpenAI's API for the smartness, and Google Cloud for auth and infra. Pretty standard stack, but the result was anything but routine.

I got a lot more than a working app. I got a front-row seat to what AI is good at, where it stumbles, and how it might change the way we build stuff going forward. Most significantly for me, it reenergised my thinking of how this could affect large-scale software organisations.

![](gooion1.png)

![](gooion2.png)

I’m not a frontend developer by trade (understatement of the century). But with GitHub Copilot at my side, and from time to time getting better help from [claude.ai](https://claude.ai), Svelte suddenly felt... learnable. Not smooth, not seamless, but a lot more accessible than it would have been otherwise. And that’s the thing: AI doesn’t solve the problem for you, but it changes how you approach the problem in the first place. It nudges you forward, fills in blanks, and occasionally writes something that almost feels like magic. Almost.

But this isn’t just a love letter to Copilot or any of these AI will replace everything LinkedIn posts. It’s just my thoughts on trade-offs, friction, and where I found myself stepping back and asking: _Wait, who wrote this code? And do I actually understand what it’s doing?_


## Context matters more than code

Here’s a small example. I needed to build a component that could share some context across nested Svelte components. The AI offered up a neat little snippet. Concise, elegant, and... wrong. Not obviously wrong, but subtly broken in a way that only shows up when you understand the lifecycle and reactivity model in Svelte. Copilot doesn’t know your architecture. It doesn’t know what you’re optimizing for. And it definitely doesn’t know the difference between “working code” and “good code.”

```
<!-- Layout.svelte -->
<script context="module">
  export let user = { name: 'Mattias' };
  import { setContext } from 'svelte';
  setContext('user', user);
</script>

<slot />

<!-- +some-page.svelte -->
<script>
  import { getContext } from 'svelte';
  const user = getContext('user');
  console.log(user.name);
</script>
```

This is the kind of mistake a seasoned developer learns to avoid over time. AI, at least today, often confuses module context with component instance lifecycle. The result? Confusion, followed by that frustrating yet strangely charming moment of getting 'Ah, thank you, now I see the problem (showing me the same "problem" slightly different again!)

That’s not a flaw, it’s a reminder. When you're working with AI tools, you’re still the architect. If you don’t know the idioms, patterns, and expected behaviors of the framework you're in, the code might run, but it won't belong. And that's where the real cost shows up: in debugging, onboarding, and long-term maintenance. I started thinking of it in the terms: Start every promt by re-iterating “Idiomatic, optimizing for, without introducing dependency to…” To be honest, I felt like talking to a genius moron.


## Now imagine this at scale

This got me thinking about larger environments. Suppose multiple services are being developed across teams, each one assisted (or led?) by AI. What happens when there's an incident? Not a simple "restart the pod" kind of issue, but a real production incident that spans services, contexts, locations, and assumptions.

In that scenario, the quality of the architecture, the clarity of ownership, the consistency of implementation, and the end-to-end understanding matter more than ever. AI might have written the code, but it won’t show up in the “war room” to explain it. At least not yet.

This isn’t hypothetical. If we move toward more agentic AI systems, or even just heavier AI assistance (that is, supercharged autocomplete), across teams, then we need more patterns and practices to develop as well:

- **The AI itself**, becoming more aware of context, patterns, interfaces, integrations, and impact.
- **The code generation**, moving beyond autocomplete into higher-level architectural thinking.
- **The ways of working**, evolving to support reviewability, traceability, and accountability even when a large portion of code wasn’t written by humans, still connecting the dots.

Any break in this evolution creates major friction. I’d even argue that our ways of working and holistic understanding need to evolve faster and stay ahead of the code parts. Anyhow, either the AI writes impressive but disconnected code, or developers lose track of the big picture and start debugging by trial and error. Neither scales.

?[excalidraw](3-ai-dev.svg)

## So what happens when AI doesn’t know?

This got me thinking, a fun (and slightly terrifying) thought experiment: What does AI do when it’s in unfamiliar territory?

Right now, the answer is usually “guess confidently and hope for the best.” But as AI systems evolve, we might start seeing more introspective behavior. Maybe it flags an area where it’s less confident, pointing the finger on someone else. Maybe it prompts a human to review something it’s unsure about. Or maybe, just maybe, it starts learning how to avoid creating a mess in the first place.

But let’s not get ahead of ourselves. Today, AI doesn’t know when it doesn’t know. That’s still our job.

## A closing note, with sarcasm

I’m not worried about being replaced by AI. Not yet. Even though part of my current role is to strategically create clarity for the entire ecosystem, this area hasn’t yet been a main focus of AI advancement. My hobby code might be 30% AI-generated, but my judgment, my architecture, and my debugging skills are still 100% human. And regularly maintained. AI is powerful, but it’s still early. Think of it less as a replacement and more like an eager junior developer who sometimes writes brilliant code and sometimes deletes your database.

I’ll keep exploring. Not because I believe AI will solve everything, but because it’s already changing how I approach learning, building, and leading. That alone makes it worth the effort.


_Stay safe & Thanks for reading_ 👍

/M