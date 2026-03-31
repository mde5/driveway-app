  Google Maps APIs                                                                                                     

  ┌──────────────┬────────────────────────────────────┬─────────────────────────┬─────────────────────────────────┐    
  │     API      │             Where used             │        Free tier        │              Risk               │    
  ├──────────────┼────────────────────────────────────┼─────────────────────────┼─────────────────────────────────┤    
  │ Geocoding    │ /listings on every search,         │ $200/month credit       │ Low — only fires on explicit    │    
  │              │ /host/new on listing creation      │ (~40,000 requests)      │ user actions                    │    
  ├──────────────┼────────────────────────────────────┼─────────────────────────┼─────────────────────────────────┤    
  │ Maps         │ /listings map view                 │ $200/month credit       │ Low — only loads when viewing   │
  │ JavaScript   │                                    │ (~28,000 loads)         │ results                         │    
  ├──────────────┼────────────────────────────────────┼─────────────────────────┼─────────────────────────────────┤
  │ Places       │ Enabled in Cloud Console but not   │ N/A                     │ None — but worth disabling to   │    
  │              │ used in code                       │                         │ reduce attack surface           │    
  └──────────────┴────────────────────────────────────┴─────────────────────────┴─────────────────────────────────┘

  The $200/month Google credit covers all three, and at hobby/MVP scale you're extremely unlikely to get close to it.  
  The only scenario that could spike is if someone wrote a bot to hammer the search page — but that's true of any
  public app.                                                                                                          

  Firebase (Spark free tier)                                                                                           
  
  ┌────────────────┬───────────────────────────────────────────┬──────────────────────────┬───────────────────────┐    
  │    Service     │                Where used                 │     Free tier limit      │         Risk          │  
  ├────────────────┼───────────────────────────────────────────┼──────────────────────────┼───────────────────────┤    
  │ Firestore      │ /listings fetches ALL listings on every   │ 50,000/day               │ Worth watching — see  │  
  │ reads          │ search                                    │                          │ below                 │    
  ├────────────────┼───────────────────────────────────────────┼──────────────────────────┼───────────────────────┤    
  │ Firestore      │ /listing (single doc), /bookings,         │ 50,000/day               │ Low                   │    
  │ reads          │ /host/listings                            │                          │                       │    
  ├────────────────┼───────────────────────────────────────────┼──────────────────────────┼───────────────────────┤    
  │ Firestore      │ Create listing, create booking            │ 20,000/day               │ Low                   │
  │ writes         │                                           │                          │                       │
  ├────────────────┼───────────────────────────────────────────┼──────────────────────────┼───────────────────────┤    
  │ Cloud          │ createCheckoutSession on Reserve          │ 2,000,000                │ Low                   │
  │ Functions      │                                           │ invocations/month        │                       │    
  ├────────────────┼───────────────────────────────────────────┼──────────────────────────┼───────────────────────┤    
  │ Hosting        │ Static file serving                       │ 10GB/month               │ Low                   │
  └────────────────┴───────────────────────────────────────────┴──────────────────────────┴───────────────────────┘  
