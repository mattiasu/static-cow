---
title: Open-Source is not about speed
category: Open-Source
author: Mattias Uhlegård
date: 2026-05-31
profileImage: muhlegard-green.jpg
tags: Open-Source, Strategy
hero: oss-eco.jpeg
intro: The internet is built on OSS, I believe the future is based on OSS and it's open principles. But are companies paying attention?
---

I've been in enough conversations about open source to notice a pattern. Someone brings up the topic, and within minutes we're talking about governance. License compliance, IP restrictions, which teams need an OSPO, how we make sure nobody accidentally commits something we can't ship. All legitimate things. All missing the point.

Because the conversation that actually matters isn't about control. It's about whether your product can survive in the ecosystem it's being released into.

That shift took me a while to fully articulate, but a podcast interview with Jensen Huang helped me. They were discussing why so many Chinese tech companies punch above their weight on innovation, and his answer wasn't what I expected. It wasn't about funding or talent density. It was about how they share. Extreme competition, but open information flow between competitors, because they've figured out that you can't build the best product alone when the product's value depends on what surrounds it.

> Interesting listen: Search for Lex Friedman Podcast 👍

In my mind, that's not just a cultural observation, it's a strategic one. And it maps directly to something I see playing out right now across enterprise software and hardware alike.

NVIDIA didn't open CUDA to be generous. They opened it because closed hardware with no ecosystem is just expensive silicon. That bet, a scary one, created a platform so embedded in developers think and how AI gets built, that competing with it isn't really a technical problem anymore, it's a gravitational one. 

OpenClaw is doing the same thing one layer up. A single developer built an open source personal AI assistant that connects to everything, WhatsApp, Gmail, GitHub, home automation, and because it was open from day one, thousands of people built integrations and skills that no single company could have shipped. It grew fast enough that its creator joined OpenAI and NVIDIA became a sponsor. The product won because the ecosystem built around it, not despite that.

SAP is learning the opposite lesson in real time. They built their moat around closed control, and now generative AI is threatening to commoditize exactly what that moat protected. Their instinct is to tighten, build everything in-house, own the full stack. But the ecosystem has already moved. You can't catch up by being more closed than you already are.

The shift is real, and it's not optional anymore. But it pushes us to think about product strategy differently than the old maturity models suggest. Or at least extends it.

## The model that got us here

There's a maturity model that's been circulating in enterprise open source circles for well over a decade. It maps how organisations typically evolve their relationship with open source across five phases: from ad hoc consumption, through policy and governance, to having champions embedded across functions, and finally to strategic participation and business models built on top of open source. It was developed in the telecom industry and has since found its way into automotive, finance, and most other traditional sectors trying to make sense of their open source posture.

It's a good model. I mean that. It gave organisations a shared language for a genuinely hard internal conversation, and it helped leaders understand that open source wasn't just a developer preference but something that needed strategy, ownership, and governance to work at scale. For a long time, getting to level three or four was a real achievement.

The thing is, it was built to answer a specific question: how do we manage our exposure to open source responsibly while capturing its benefits? License compliance, IP protection, contribution policies, internal champions. All of that is still necessary. None of it is sufficient anymore.

Because the question that actually determines whether your product wins or loses in the next decade isn't about how well you govern your open source consumption. It's about whether you're genuinely participating in the ecosystems that are shaping what your product can become.

Those are related questions. But they're not the same question.

## So, what about the ecosystem

Here's the shift that I think most enterprise leaders haven't fully internalised yet. Your product's value is increasingly determined not by what it does in isolation, but by what it can connect to, build on, and participate in.
That's not a new observation in consumer tech. We understood it when smartphones became platforms. We understood it when cloud infrastructure became the default substrate for every new business. But in traditional industries, the instinct is still to think about the product first and the ecosystem second. Build the thing, then figure out how it connects.

> That order needs to flip.

When a software-defined product launches today, the question isn't just "is it good?" It's "can the ecosystem build around it?" Can other services connect to it? Can developers extend it? Can it talk to the infrastructure your customers already have? If the answer is no, you haven't shipped a complete product. You've shipped something that will become increasingly stranded as the world around it moves on.

This is what Jensen Huang was getting at when he talked about why open source ecosystems produce disproportionate innovation. It's not generosity. It's gravity. NVIDIA didn't open CUDA because they felt like sharing. They opened it because closed hardware with no ecosystem is just expensive silicon. The moment developers could build freely on top of it, the platform became self-reinforcing. Every tool, every model, every research paper that assumed CUDA made the next one more likely to assume it too. That's not a product anymore. That's infrastructure.

SAP built the opposite. A moat so deep that replacing it cost more than keeping it, which felt like safety until generative AI started routing around the whole layer entirely. Their instinct now is to tighten, to own the full stack before someone else does. But you can't out-close an ecosystem that's already moved.

And OpenClaw, built by a single developer and a community, connected to everything from day one, and grew fast enough that NVIDIA became a sponsor and its creator ended up at OpenAI. Not because the AI underneath was uniquely powerful. Because the ecosystem could build on top of it without asking permission.

The pattern is the same across all three. Openness isn't the point. Ecosystem participation is. And the companies that understand the difference are the ones positioning themselves as essential infrastructure rather than replaceable products.

## Ok, so what do you do?

Let's be real for a while. If you launch a software-defined product with a closed integration proposal, that will probably not hit you from the get go. It might be a success, might get great reviews. But the ecosystem around it will continue to move, standards will settle, integration will emerge, communities will grow, and at some point you'll notice that catching up isn't as easy as fixing the roadmap. It's restructuring, re-architecting. Or, it's too late.

> Oh, btw, that's not a prediction. It's a pattern. We've seen it in mobile, in cloud, and we're watching it happen in AI right now.

TO be clear, I'm not assuming this is an easy conversation to have internally. In many companies and organisations, open source is still being debated at the level of license compliance and legal risk. I know, I've been there for most of my career. But while you're having that conversation, the ecosystem isn't waiting.

So the first thing to change is the question you ask, if you have the opportunity to influence, when you're launching something new. Not "how do we protect our advantage in this product" but "what does the ecosystem need from this product to build around it?" That question sounds simple. It isn't, because it requires giving up some control before you know exactly what you're giving it up for. But it's the question that determines whether your product becomes "infrastructure" or "inventory".

The second thing is less about decisions and more about presence. The integration standards, the AI tooling (wherever that takes us), the infrastructure defaults that will shape the industry in x years, those aren't being decided in boardrooms. They're being shaped right now in open communities, working groups, and foundations. If youre not there, or your engineers aren't, you're not just missing out of the innovation. You're absent from the conversations that produce it. And absent means you'll spend years complying with decisions you could have influenced.

Neither of these is an engineering problem. They're strategic choices that happen to have engineering implications. Which means they belong in the room where product strategy gets decided, not just the OSPO.

_Stay safe & Thanks for reading_ 👍

/M

Further reading on the open source maturity model in an automotive context here: [remotivelabs.com/accelerating-open-source](https://remotivelabs.com/accelerating-open-source)
