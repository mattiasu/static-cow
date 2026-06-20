---
title: The Moron got smarter, which might be a problem. 
date: 2026-06-07
category: AI
author: Mattias Uhlegård
profileImage: muhlegard-green.jpg
hero: ai-balance.jpg
intro: A year ago I wrote about building with Go, Svelte, and AI assistance. I called it a genius moron. That framing worked for a while. It doesn't anymore.
tags: AI, Engineering culture, Architecture
---


Last year's short version: impressive output, shaky foundations, sometimes really frustrating. AI didn't know my architecture, didn't know the difference between working code and good code, and when it got something wrong it did so confidently and repeatedly. Genius moron felt right.

This past month I went back to building. A static blog refactor of addy.se and a small Rust project, defl.rs, a Http deflector. Same idea: use languages I hadn't worked with much, see where AI actually helps. This time with agentic AI rather than autocomplete. An agent that could do all the things everyone is either ranting about or loving; read files, run commands, and make decisions across a whole session and code base.

The experience was genuinely different.


## The moron got smarter

For me this was initially a blast. The agent didn't just suggest code. It moved. It read the project structure, formed a view, and got on with it. Multi-step, mostly correct, often fast. For someone who hasn't written Rust professionally, that's a shift.

But here's the thing: it was almost always correct.

It took shortcuts I wouldn't have taken, made assumptions I didn't know it had made, and implemented its chosen approach fully and cleanly, without stopping to ask if that was the right approach. Well, that's not true really, since initially it asked permission for every little detail it wanted to change. When I reviewed what it had built, I couldn't find the bug. Because there wasn't one.

Here's where the old framing breaks down. The "genius moron" was easy to work with in one specific way: when it was wrong, you knew. The smarter version succeeds in ways that are hard to notice. The cost is more subtle than a broken build or stuck-in-a-loop proposals.


## Correct isn't the same as right

When I built the Rust deflector, the agent made a structural choice early on about routing. Not wrong. Idiomatic enough. But not the choice I would have made. And by the time I noticed, the decision was already somewhat load-bearing. Off-course, in a super simple small side-project this is not a big thing to refactor. But in a real large scale ecosystem, unpicking something like this could have cost more than living with the debt.

That's a new kind of friction. Not "AI broke something I need to fix" but "AI built something I now have to own" without noticing, yet part of the reasoning that produced it.

It's to me an ownership problem. When the tool can only autocomplete, you stay in the driver's seat, just coding faster. When it can decide and execute, you have to actively choose, or not, to not loose the engineering. It's no longer about coding, it's about software engineering.


## What needs to shift, simultaneously

Ok, back to the old article. The gap from the Svelte/Go post, AI coding capability racing ahead while ways of working lag behind, still relevant. With agentics it's way wider.

Three things I've started doing and thinking about differently.

**Steer before you start.** The agent's first move sets a lot of downstream decisions. I've started being way more explicit upfront: what I'm optimising for, what I'm not willing to introduce, what the constraints and trade-offs are. Not a long brief, YAGNI, but a deliberate one.

**Review decisions, not just the code.** Just Reviewing PR's are probably too late. The decision that mattered was probably made three steps earlier. We need to transition from "does this work and follows our good coding practices" to "are we safeguarding our engineering values and what trade-offs did this decide and why."

**Own the things you can't explain.** If the agent built something I can't fully explain, I don't actually own it. I'm just hosting it. That distinction matters a lot more when something goes wrong at 2am.


## Two projects, two agents, zero shared memory

Another context that made this exploration genuinely different. Last time it was one project, one context. This time I had two things running in parallel, addy.se and defl.rs, with separate agents in each. Trying to "simulate" multi-team development.

They didn't talk to each other, intentionally. But the consequence was more interesting than I expected: I was the only shared memory in the system. When I moved between projects, I was the one carrying the tradeoffs, the constraints, the reasoning. The agents optimised locally, correctly, and independently. Which works fine until it doesn't.

For a simple hobby project, manageable for sure. But scale that to multiple teams and 100x agents, and the organisation quietly loses the thread of why things were built the way they were. Scary.


?[excalidraw](ai-moron-2.svg)


If you want agents to work coherently across a large engineering organisation, you need something they can all read from. Not a wiki, not a README. Something programmatically accessible and maintained with the same discipline as the code itself. A company memory that contains the things an agent needs to make decisions that are not just locally correct but globally coherent: the idioms we've committed to, the constraints we've decided not to cross, the reasoning behind the structural decisions that are now key, and enough context about domain boundaries that an agent can recognise when a choice belongs to someone else. We need to codify our engineering values and our organisations cultural values.

Most conversations about agentic AI I hear in large organisations are still at the "how do we govern the outputs" stage. The harder question is how you give agents enough shared collective understanding that governance becomes more manageable. That's for sure a new post, when and if I come up with a reasonable approach or at least how not to do it. Anyhow, it does connect directly to previous posts on Outcome-Driven-Architecture, and, surprise, it turns out the problem doesn't get easier when agents and people are involved. 


## What's worth protecting

I'm not kidding anyone, nothing of this is an argument for using less AI. It's more an argument for being intentional about what you're not willing to let go of, even when letting go would be initially faster.

For me, being able to answer the questions: What do our engineering organisation value, what are the things we protect, the tradeoff reasoning we really care about, and how do we continuously have the ability to explain what something does and why. That's going to be the game-changer. 

"The moron" was easy to keep honest because it made mistakes you could see. The smarter, infinity more scalable version, requires more discipline, not less. You have to decide in advance what good looks like, and hold that line even when the agent's version of good is close enough to pass inspection.

That's the shift I think about. Not the tools (even if you fell really productive). In what we need to be real and explicit about so the tools magnifies the right things, not what's "less right". It's going to an interesting future. 


_Stay safe & Thanks for reading_ 👍

/M
