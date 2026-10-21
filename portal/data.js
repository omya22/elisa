/* Dummy data for the portal prototype. Shaped like the Upp v2 API responses
   (GET /v2/courses, /v2/courses/{id}/curriculum) so it can be swapped for real calls later. */
window.PORTAL_DATA = {
  organization: 'Elísa Viðars',
  storeUrl: '../#namskeid',
  courses: [
    {
      id: 'netnamskeid',
      name: 'Netnámskeið',
      description: 'Hópnámskeið á netinu þar sem þú lærir að setja saman næringarríkar máltíðir.',
      longDescription: 'Hópnámskeið á netinu þar sem þú lærir að setja saman næringarríkar máltíðir. Við förum yfir grunninn í næringu, hvernig þú setur saman disk sem endist þér út daginn og hvernig þú skipuleggur vikuna svo það verði auðvelt að halda þetta út.',
      image: '../assets/kitchen-counter.jpg',
      archived: false,
      unlock: 'all',              // all | order
      completion_rule: 'either',  // manual | video_watched | either
      attachments: [
        { id: 'a1', title: 'Innkaupalisti.pdf', kind: 'pdf', size: 245760 },
        { id: 'a2', title: 'Uppskriftir', kind: 'link', url: '../#namskeid' }
      ],
      sections: [
        { id: 's1', title: 'Grunnurinn' },
        { id: 's2', title: 'Máltíðir í framkvæmd' }
      ],
      lectures: [
        { id: 'n1', section: null, title: 'Velkomin – svona virkar námskeiðið', duration: 240, poster: '../assets/hero.jpg' },
        { id: 'n2', section: 's1', title: 'Orka og næringarefni', duration: 840, poster: '../assets/tomatoes.jpg' },
        { id: 'n3', section: 's1', title: 'Prótein, kolvetni og fita', duration: 720, poster: '../assets/card-food.jpg' },
        { id: 'n4', section: 's1', title: 'Að lesa á umbúðir', duration: 480, optional: true, poster: '../assets/melon.jpg' },
        { id: 'n5', section: 's1', title: 'Diskurinn sem endist', duration: 960, poster: '../assets/course-video.jpg',
          attachments: [{ id: 'a3', title: 'Vikuplan.pdf', kind: 'pdf', size: 184320 }] },
        { id: 'n6', section: 's2', title: 'Morgunmatur', duration: 600, poster: '../assets/woman.jpg' },
        { id: 'n7', section: 's2', title: 'Hádegismatur á ferðinni', duration: 660, poster: '../assets/kitchen-counter.jpg' },
        { id: 'n8', section: 's2', title: 'Kvöldmatur fyrir alla fjölskylduna', duration: 780, poster: '../assets/tomatoes.jpg' },
        { id: 'n9', section: 's2', title: 'Millimál', duration: 420, poster: '../assets/melon.jpg' },
        { id: 'n10', section: 's2', title: 'Að skipuleggja vikuna', duration: 720, poster: '../assets/card-food.jpg' },
        { id: 'n11', section: 's2', title: 'Út að borða', duration: 540, poster: '../assets/hero.jpg' },
        { id: 'n12', section: 's2', title: 'Næstu skref', duration: 300, poster: '../assets/course-video.jpg' }
      ]
    },
    {
      id: 'ithrottafolk',
      name: 'Næring fyrir íþróttafólk',
      description: 'Hvað, hvenær og hversu mikið – fyrir æfingar, leiki og endurheimt.',
      longDescription: 'Hvað, hvenær og hversu mikið – fyrir æfingar, leiki og endurheimt. Fyrirlestrarnir opnast einn af öðrum svo þú byggir ofan á það sem þú hefur lært.',
      image: '../assets/tomatoes.jpg',
      archived: false,
      unlock: 'order',
      completion_rule: 'video_watched',
      attachments: [{ id: 'b1', title: 'Leikdagsplan.pdf', kind: 'pdf', size: 312000 }],
      sections: [],
      lectures: [
        { id: 'i1', section: null, title: 'Af hverju næring skiptir máli', duration: 420, poster: '../assets/about-football.jpg' },
        { id: 'i2', section: null, title: 'Fyrir æfingu', duration: 600, poster: '../assets/card-food.jpg' },
        { id: 'i3', section: null, title: 'Á leikdag', duration: 780, poster: '../assets/tomatoes.jpg' },
        { id: 'i4', section: null, title: 'Endurheimt', duration: 540, poster: '../assets/melon.jpg' },
        { id: 'i5', section: null, title: 'Vökvi og sölt', duration: 360, optional: true, poster: '../assets/kitchen-counter.jpg' },
        { id: 'i6', section: null, title: 'Ferðalög og mót', duration: 480, poster: '../assets/hero.jpg' },
        { id: 'i7', section: null, title: 'Samantekt', duration: 300, poster: '../assets/course-video.jpg' }
      ]
    },
    {
      id: 'morgunmatur',
      name: 'Morgunmatur sem endist',
      description: 'Stutt námskeið um morgunmat sem heldur þér gangandi fram að hádegi.',
      longDescription: 'Stutt námskeið um morgunmat sem heldur þér gangandi fram að hádegi.',
      image: null,
      archived: true,
      unlock: 'all',
      completion_rule: 'manual',
      attachments: [],
      sections: [],
      lectures: [
        { id: 'm1', section: null, title: 'Af hverju morgunmatur?', duration: 300, poster: '../assets/woman.jpg' },
        { id: 'm2', section: null, title: 'Fimm einfaldar hugmyndir', duration: 540, poster: '../assets/card-food.jpg' },
        { id: 'm3', section: null, title: 'Undirbúningur kvöldið áður', duration: 420, poster: '../assets/melon.jpg' }
      ]
    }
  ],
  // Starting progress for the demo account (what the learner "already did")
  seedProgress: {
    netnamskeid: { started: '2026-09-28', done: ['n1', 'n2', 'n3', 'n4'], pos: { n5: 372 } },
    morgunmatur: { started: '2026-09-02', done: ['m1', 'm2', 'm3'], completed: '2026-10-03', pos: {} }
  }
};
