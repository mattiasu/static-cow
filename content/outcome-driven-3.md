---
title: Outcome-Driven Architecture: Part 3, shifting the story
date: 2026-03-15
category: Architecture
author: Mattias Uhlegård
profileImage: muhlegard-green.jpg
hero: spin.jpg
intro: You've done the analysis. You know what needs to happen. You walk into the room and explain it clearly...  and still leave with nothing.
tags: EA, Architecture, Engineering leadership
---

After my last post on [outcome-driven architecture](https://addy.se/posts/outcome-driven-architecture-balancing-code-collaboration-and-context/), I got a message from a former colleague. Good feedback, the kind that sticks. They liked the thinking but had one question: what does "outcome" actually mean in practice? It's easy to say architecture should be driven by outcomes. It's harder to explain what that looks like when you're standing in front of a leadership team that needs to make a real decision.
Fair point. This is my attempt to answer that.

## Familiar story
If you've worked with software development or in IT, perhaps even "Digital", you've probably all been there. You've done the analysis. You know the system is struggling. You know what needs to happen. You walk into the room, whether that's a Slack channel, a steering committee, or an investment review, and you explain it clearly. And then the questions start.


"Can't we just fix it for now?"

"What's the actual business impact?"

"Why does this cost so much?"

You leave that room with either a compromised budget for the wrong solution, or nothing at all. Not because you were wrong. But because the connection between what you were describing and what the room cared about wasn't visible to anyone but you.
That sounds obvious when I write it down. It isn't.

If you've come from a digital native company, you probably haven't hit this wall before. Not because those organizations are smarter or better run, but because they were built with the wiring already in place. Everyone more or less understands how a technical decision ripples into a business outcome. When something breaks in that chain, the signal is short and readable. The CTO, the product lead, and the engineer are often looking at the same dashboard.
In a large traditional enterprise, that connection still exists. It's just buried. Under decades of system integrations, market-specific workarounds, inherited platforms, and organizational layers that were never designed to talk to each other. Nobody is deliberately hiding the relationship between your legacy system and the metric that matters. It's just that nobody has ever had to draw it explicitly, because the org grew faster than its own legibility.
That gap, between the decision and the outcome, is exactly what most engineering leaders walk into when they move into larger organizations. And why good technical decisions so often die in the wrong room.

?[excalidraw](disconnect.svg)

### Same room, different language

A while back, I was working within a large traditional enterprise. A company with real physical weight to it, assets, inventory, markets, the kind of organization where a bad quarter isn't just a missed target but capital tied up in the wrong place at the wrong time. They were also navigating significant market transition, which meant the pressure on getting operational decisions right was higher than usual.
We needed to get a decision made. A significant one, involving legacy systems that were struggling to scale under the demands of a business growing faster than the infrastructure underneath it. The kind of decision that, taken to a traditional investment board, would generate exactly the wrong conversation. Costs, timelines, complexity. All legitimate questions, but none of them the right starting point.
So instead of leading with the technology, we led with the outcome.

We asked the leadership team a simple question. Does it matter to you how much inventory you carry on your books at any given time? Obviously it did. At that scale, inventory represents serious capital, and in a volatile market, carrying the wrong amount in the wrong places at the wrong time is a genuine business risk. Every person in that room understood that without needing it explained.
Then we made the connection. The system we were discussing was directly involved in managing that flow. And it had scaling constraints that, left unaddressed, would meaningfully limit the company's ability to respond to demand shifts. Not in a theoretical future. In the next growth cycle.
That's not a technology problem anymore. That's a business risk with a number attached to it.
The room didn't suddenly become easy. Still questions, still challenges, still people looking for a cheaper path. But the conversation shifted. Instead of "why do we need to spend this much," it became "what level of inventory risk are we willing to carry." That's a question leadership can engage with. And it leads somewhere.
What made that possible wasn't a clever argument. It was the work done beforehand to trace the connection, from the technical constraint, through the operational process it affected, through the business capability it supported, all the way up to a metric the leadership team could reason over. That chain existed in the organization. It just hadn't been made visible before.

That's the actual job. Not translating technology into business language. Drawing the map so the connection speaks for itself.

### So, back to the original question: what is an outcome, actually?

> Well, it depends. An architecs standard answer. 
> And No, that's not a cop-out, it's the honest answer.

In a digital native company, everyone can see how the pieces connect. Not because they're smarter, but because the system was built that way from the start. Customer acquisition cost, conversion rate, time to deploy. The metrics are close to the surface and the teams that influence them know it. The wiring is short.
In a large traditional enterprise the metrics that matter are just as real, but the path between a technical decision and those metrics is long, tangled, and usually undocumented. Which means the first job isn't defining the outcome. It's making the connection visible enough that the right people can have the right conversation.
To me, that's what outcome-driven architecture is actually about. Not a framework for getting decisions right. A way of making sure the right people can even see what the decision is truly about.

The layers involved, from value streams down through processes, capabilities, data, applications, and infrastructure, are worth exploring in detail. But that's a follow-up. If this resonates and you'd find a more tangible walkthrough of that mapping useful, let me know.

_Stay safe & Thanks for reading_ 👍

/M
