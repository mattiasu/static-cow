---
title: The gap nobody really documented
date: 2026-06-20
category: AI Adoption
author: Mattias Uhlegård
profileImage: muhlegard-green.jpg
hero: org-mem.jpg
intro: The gap between what your company believes and what your systems actually do has always existed. For most of software history, humans patched it. Agents don't patch gaps. They widen them, fast. What comes next?
tags: AI adoption, Engineering culture, technology
---

For as long as I worked in this industry, organizational knowledge has existed in two kinds of buckets that never really talk to each other.

On one side, you have the abstraction layer. The principles doc. The architecture guidelines. The "this is what we believe in" page that someone wrote with good intentions, probably after a difficult incident or a long offsite. It lives in SharePoint, or Confluence, or Notion, depending on which era the team came from. It's written in prose. It describes intent.

On the other side, you have the code. The actual system. The thing that runs. And sitting just above it, if you're lucky, some form of generated documentation — JavaDoc, docstrings, OpenAPI or AsyncAPI specs. These describe what the code does. Not why. Not what tradeoffs were made. Not what the team was optimizing for when they made a choice that looks strange now. Just: here are the inputs, here are the outputs, here is the structure. You migth say, well that's what ADRs are for, right, ala Martin Fowler? In one way you would be right, that would give more clarity on the why. But scaling it cross organisational, with company wide guardrails, practices, requirements and constraints, across multiple tech stacks, that would most likely go back to interpretation an tacid knowledge. 

So, here's where I see the gap surface. The gap where organizational memory actually lives. And for most of software history, that gap has been filled by people. Senior engineers who remember. Tech leads who were in the room. Architects who can explain why the system looks the way it does. That's not documentation, more archaeology.

## What generated docs never gave us

JavaDoc, as an example, was never really documentation. To me, all it was, or is for that matter, is text representation of the code, structured enough to be navigable, but not meaningful in any deeper sense. It told you how something worked, which is useful. But, it didn't tell you whether this was a good example of the team's principles or a known compromise. It didn't tell you what to watch out for, or what the original intent was before three rounds of scope changes. It described the fact of the code, not the thinking behind it.

![Software Archeology](tacid-k.jpg)

The SharePoint or Notion principles pages did the opposite. It described thinking, but it floated free of any actual system. You couldn't look at a piece of code and trace it back to a principle. You couldn't look at a principle and find where it was honored and where it was quietly abandoned. The two layers existed in parallel, never intersecting.

We've kind of just lived with this because we didn't have another good option. The people in the middle, the ones who held both layers in their heads simultaneously, were the connective tissue. When they left, the connection left with them.

## Enter, for good and bad, the agents

AI agents don't inherit tacit knowledge. They work with what's written down. A human engineer, still feels weird to say that, joining a new team picks up the unwritten rules over weeks of PRs and Slack threads and overheard conversations. An agent has none of that, or? It reads what exists, and if what exists is a disconnected principles page on one end and undocumented code on the other, it connects them anyway, confidently, and often wrong.

This is new pressure on a very old problem. The gap was always there. Agents just make it expensive in ways it wasn't before. And that's actually useful information, because it forces the question: what would it look like to actually close it?

## The bridge I believe we don't have yet

Here's where I think it gets harder. Closing the gap isn't just about better documentation habits or smarter agents. It requires a new form of knowledge artifact that doesn't really exist yet, something that lives between "here's the principle" and "here's the code," that connects intent to implementation in a way that's meaningful to both humans and machines.

Not a wiki page. Not a docstring. Something more like: this decision was made, or should be made, because of this principle, under these constraints, and here's where you can see it in the system, and here's where we knowingly deviated and why. Structured enough to be queryable. Human enough to be written and maintained by the people who actually understand the tradeoffs.

The form matters as much as the content. A principle buried in a narrative doc and a principle expressed in a structured, linked, machine-readable format are not the same thing, even if the words are identical. One can participate in a connected organizational memory. The other just sits there.

## So, why now you might wonder?

For the first time, we have tooling that could actually traverse this. Agents that can read code and extract structure. Models that can understand intent and connect it to implementation. The technical capability to link the abstract to the factual is closer than it's ever been.

But the tooling only works if both ends are well-formed. If the principles side is a rambling page nobody's touched in two years, and the code side carries no intent beyond its own execution, connecting them faster just produces confident nonsense. The bridge needs something to connect to.

So the real work is figuring out what organizational memory should actually look like when it's designed to serve both humans and agents. What that form is, I don't think we've fully worked out yet. But the organizations that get there first will have something genuinely valuable: knowledge that doesn't walk out the door, that agents can reason over, and that humans can still own, maintain, and trust.

That's worth figuring out.


Stay safe & Thanks for reading 👍

/M

