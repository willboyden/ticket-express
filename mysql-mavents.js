//works

var eventlist = (param1) => {
  // Code here
  return ` select distinct 
  tmve.name as eventname
  , tmve.venue_id
  , CAST(tmve.dates_start_dateTime as DATE) as eventdate 
  , tv.name as venuename
  , tv.latitude as latitude
  , tv.longitude as longitude
  , 'ticketmaster' as dataource
  from tblnewticketmastervenueevent tmve
  left join tblticketmastervenue tv on tv.id = tmve.venue_id
  where tv.name not like '%Parking%'
  union
  select distinct sve.name as eventname
  , CAST(sve.eventDate as DATE) as eventdate
  , sve.venue_id
  , sv.name as venuename
  , sc.latitude as latitude
  , sc.longitude as longitude
  , 'stubhub' as datasource
  from tblnewstubhubvenueevent sve
  left join tblstubhubvenue sv on sve.venue_id =sv.id
  left join tblstubhubcity sc on sc.city = sv.city
  where sv.name not like '%Parking%'
                               `;
};
module.exports.eventlist = eventlist;

var stubhubEvents = (venueName) => {
  // Code here
  return `         SELECT ve.name as \`Event Name\`  
                            , eventDate as \`Event Date\`   
                            , minListPrice \`Min Cost\`  
                            , maxListPrice \`Max Cost\`   
                            , 'stubhub' as \`dataSource\`
                           FROM tblnewstubhubvenueevent ve   
                            LEFT JOIN tblstubhubvenue v  on ve.venue_id = v.id   
                           WHERE eventDate is not null    
                               AND  ${
                                 venueName
                                   ? `v.name = '${venueName}' order by eventDate`
                                   : "1=1"
                               } 
                               `;
};
module.exports.stubhubEvents = stubhubEvents;

//works
var ticketmasterEvents = (venueName) => {
  return `
    with ve as 
            (             
                SELECT  
                  \`venue_id\` 
                , \`genre_name\`  
                , \`name\` as \`Event\`  
                , \`priceRanges_max\` as \`maxTicketCost\`  
                , \`priceRanges_min\` as \`minTicketCost\` 
                , CAST(\`dates_start_dateTime\` as DATE) as \`Event Date\`  
                  FROM tblnewticketmastervenueevent ve  
                -- filter to only include results from nost recent scrape      
            ) 
            SELECT  
            ve.\`Event\` as \`Event Name\`  
            , ve.\`Event Date\`  
            , ve.\`genre_name\` as \`Genre\`  
            , ve.\`maxTicketCost\` as \`Min Cost\`  
            , ve.\`minTicketCost\` as \`Max Cost\`  
            , 'ticketmaster' as \`dataSource\`
            FROM ve   
              LEFT JOIN tblticketmastervenue v   
                ON v.id = ve.venue_id 
              WHERE  ${venueName ? `v.name = '${venueName}'` : "1=1"} 
              GROUP BY   
                ve.\`Event\`
                , ve.\`Event Date\`  
                , ve.\`genre_name\` 
                , ve.\`maxTicketCost\` 
                , ve.\`minTicketCost\`
                , \`dataSource\` 
                  ORDER BY  
                  ve.\`Event Date\` 
                , ve.\`Event\`   
                `;
};
module.exports.ticketmasterEvents = ticketmasterEvents;
//works
//hmm mssql server has an INCLUDE_NULL_VALUES clause when returning json. How is that handled in this senario???
var cityvenues = (eventDate) => {
  // Code here
  return `WITH a AS ( SELECT 
                   v.\`id\` as venueid
                    , v.\`name\`
                    , v.\`city\`  
                    , c.\`latitude\`
                    , c.\`longitude\`
                    , 'stubhub' as dataSource
                FROM \`tblstubhubvenue\` v                          
                LEFT JOIN \`tblstubhubcity\` c
                    ON v.city=c.city
                WHERE id in(
                    select distinct(venue_id)  from \`tblnewstubhubvenueevent\`  
                    ${
                      eventDate
                        ? `where CAST(\`eventDate\` as DATE) = '${eventDate}'`
                        : ""
                    }
                )
                    UNION                 
                SELECT
                    \`id\` as venueid
                    ,\`name\`
                    ,\`city\`
                    ,\`latitude\`
                    ,\`longitude\`
                    , 'ticketmaster' as dataSource
                FROM \`tblticketmastervenue\`
                WHERE id in(
                    select distinct venue_id   from \`tblnewticketmastervenueevent\`
                    ${
                      eventDate
                        ? `where CAST(\`dates_start_dateTime\` as DATE) = '${eventDate}'`
                        : ""
                    }
                )
            )
            , b as ( select 
                \`name\`
                , count(1) as duplicate
                , min(dataSource) as dataSource 
                from a 
                group by \`name\`
            ), multiple as (
                select 
                    a.\`venueid\`
                    ,a.\`name\`
                    ,a.\`city\`
                    ,a.\`latitude\`
                    ,a.\`longitude\`
                    , case duplicate when 2 Then 'multiple' ELSE b.dataSource end as dSource 
                from b 
                left join a on a.\`name\` = b.\`name\`
            )
            select 
            \`venueid\`
            ,\`name\`
            , min(city) as city
            , min(latitude) as latitude
            , min(longitude) as longitude
            , min(dSource) as dataSource
            from multiple
            WHERE dSource = 'multiple'
            GROUP BY \`name\`
            UNION
            select * from multiple 
            WHERE dSource != 'multiple'
            AND \`name\` NOT LIKE  '%Parking Lots'`;
};
module.exports.cityvenues = cityvenues;

var events = (venueName) => {
  return `
                    WITH ve as 
                        (
                            SELECT
                            \`venue_id\`
                            , \`id\` as \`EventId\`
                            , \`genre_name\`
                            , \`name\` as \`Event\`
                            , \`priceRanges_max\` as \`maxTicketCost\`
                            , \`priceRanges_min\` as \`minTicketCost\`
                            , \`url\`
                            , CAST( \`dates_start_dateTime\` AS DATE) as \`Event Date\` 
                            FROM tblnewticketmastervenueevent ve
                        )
                    SELECT 
                        v.\`name\` as \`Venue\` 
                        , ve.\`Event\` as \`Event Name\`
                        , ve.\`EventId\`
                        , ve.\`Event Date\`
                        -- , ve.\`genre_name\` as \`Genre\`
                        , ve.\`maxTicketCost\` as \`Min Cost\`
                        , ve.\`minTicketCost\` as \`Max Cost\`
                        , ve.\`url\`
                        , 'ticketmaster' as dataSource
                    FROM ve
                    LEFT JOIN tblticketmastervenue v 
                        ON v.id = ve.venue_id
                    WHERE 1=1 
                    -- AND ve.genre_name is not null
                        ${venueName ? "AND `name` = '" + venueName + "'" : ""} 
                    GROUP BY
                    v.\`name\`
                        , ve.\`Event\`
                        , ve.\`Event Date\`
                        , ve.\`genre_name\`
                        , ve.\`maxTicketCost\`
                        , ve.\`minTicketCost\`
                        
                            UNION
        
                    SELECT 
                    v.\`name\` as \`Venue\` 
                    , ve.\`name\` \`Event Name\`
                    , ve.\`id\` as \`EventId\`
                    , ve.eventDate \`Event Date\`
                    , ve.\`minListPrice\` \`Min Cost\`
                    , ve.\`maxListPrice\` \`Max Cost\`
                    , 'stubhub' as dataSource
                    , ('https://www.stubhub.com/event/' + ve.\`id\`) as url
                    FROM \`tblnewstubhubvenueevent\` ve
                    LEFT JOIN \`tblstubhubvenue\` v
                    on ve.venue_id = v.id
                    WHERE  eventDate is not null
                        ${
                          venueName ? "AND v.`name` = '" + venueName + "'" : ""
                        } 
                    order by \`Event Date\`   
                `;
};
module.exports.events = events;

var venueAddress = (venueName) => {
  return `
    WITH a as (
        SELECT
            \`name\`
            ,\`postalCode\`
            ,\`city\`
            ,\`state\`
            ,\`address1\`
            ,\`address2\`
        FROM \`tblticketmastervenue\`

            UNION

        SELECT
            \`name\`
            ,\`postalCode\`
            ,\`city\`
            ,\`state\`
            ,\`address1\`
            ,\`address2\`
        FROM \`tblstubhubvenue\`
    )
    select
        \`name\`
        ,\`postalCode\`
        ,\`city\`
        ,\`state\`
        ,\`address1\`
        ,\`address2\` from a
        ${venueName ? " where `name` = '" + venueName + "' LIMIT 1" : ""}`;
};
module.exports.venueAddress = venueAddress;

var venueEventsMultiVender = (venueName) => {
  return (
    `
  with ve as
  (
    SELECT
      \`venue_id\`
  --        , \`genre_name\`
    , \`name\` as \`Event\`
    , \`priceRanges_max\` as \`maxTicketCost\`
    , \`priceRanges_min\` as \`minTicketCost\`
    , CAST(\`dates_start_dateTime\` as DATE) as \`Event Date\`
    , 'ticketmaster' as \`dataSource\`
      FROM tblnewticketmastervenueevent ve
    -- filter to only include results from nost recent scrape
  )
  SELECT
  ve.\`Event\` as \`Event Name\`
  , ve.\`Event Date\`
  --  , ve.\`genre_name\` as \`Genre\`
  , ve.\`maxTicketCost\` as \`Min Cost\`
  , ve.\`minTicketCost\` as \`Max Cost\`
  , 'ticketmaster' as \`dataSource\` 
  FROM ve
    LEFT JOIN tblticketmastervenue v
    ON v.id = ve.venue_id
    ${venueName ? " where v.`name` = '" + venueName + "'" : ""}` +
    `
        union         
   SELECT ve2.\`name\` as \`Event Name\`
        , eventDate as \`Event Date\`
        , minListPrice as \`Min Cost\`
        , maxListPrice as \`Max Cost\`
        , 'stubhub' as \`dataSource\` 
         FROM tblnewstubhubvenueevent ve2
        LEFT JOIN tblstubhubvenue v2  on ve2.venue_id = v2.id
         WHERE eventDate is not null
         ${venueName ? " and v2.`name` = '" + venueName + "'" : ""}` +
    `
    GROUP BY
    \`Event Name\`
    ,\`Event Date\`
    ,\`Max Cost\` 
    ,\`Min Cost\` 
   -- ,\`dataSource\`
      ORDER BY
      \`Event Date\`
    , \`Event Name\`
        `
  );
};
module.exports.venueEventsMultiVender = venueEventsMultiVender;

// exports.GetSpecificVenueSummary = function getVenueSummary(params) {
//   let result = "";
//   if (params.dataSource == "stubhub") {
//     result = GetSpecificStubhubVenueSummary(params.venueName);
//   } else if (params.dataSource == "ticketmaster") {
//     result = GetSpecificTicketmasterVenueSummary(params.venueName);
//   } else {
//     // result = $"[{GetSpecificStubhubVenueSummary(venue)}, {GetSpecificTicketmasterVenueEventSummary(venue)}]";
//     result = GetSpecificVenueEvents(params.venueName);
//   }
//   return result;
// };

//gets events for a specific venue using the methods above
module.exports.venueEvents = function (params) {
  var result = "";
  if (params.dataSource == "stubhub") {
    result = stubhubEvents(params.venueName);
  } else if (params.dataSource == "ticketmaster") {
    result = ticketmasterEvents(params.venueName);
  } else {
    result = venueEventsMultiVender(params.venueName);
    // result = [
    //   getTicketmasterEvents(params.venueName),
    //   getStubhubEvents(params.venueName)
    // ];
  }
  return result;
};
//module.exports.venueEvents;
