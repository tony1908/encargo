/**
 * Terminal49 API Integration
 * Terminal49 container tracking API response
 * Based on: https://terminal49.com/docs/api-docs/api-reference/containers/get-container-route
 */

export interface Terminal49RouteLocation {
  id: string;
  type: 'route_location';
  attributes: {
    created_at: string;
    updated_at: string;
    inbound_scac: string | null;
    inbound_mode: 'vessel' | 'rail' | null;
    inbound_eta_at: string | null;
    inbound_ata_at: string | null;
    inbound_voyage_number: string | null;
    outbound_scac: string | null;
    outbound_mode: 'vessel' | 'rail' | null;
    outbound_etd_at: string | null;
    outbound_atd_at: string | null;
    outbound_voyage_number: string | null;
  };
  relationships: {
    location: {
      data: {
        id: string;
        type: 'port';
      };
    };
    inbound_vessel: {
      data: {
        id: string;
        type: 'vessel';
      } | null;
    };
    outbound_vessel: {
      data: {
        id: string;
        type: 'vessel';
      } | null;
    };
  };
}

export interface Terminal49Port {
  id: string;
  type: 'port';
  attributes: {
    name: string;
    nickname: string;
    code: string;
    country_code: string;
    latitude: number;
    longitude: number;
  };
}

export interface Terminal49Vessel {
  id: string;
  type: 'vessel';
  attributes: {
    name: string;
    imo: string;
    mmsi: string;
    call_sign: string;
  };
}

export interface Terminal49RouteResponse {
  data: {
    id: string;
    type: 'route';
    attributes: {
      id: string;
      created_at: string;
      updated_at: string;
    };
    relationships: {
      route_locations: {
        data: Array<{
          id: string;
          type: 'route_location';
        }>;
      };
    };
  };
  included: Array<Terminal49RouteLocation | Terminal49Port | Terminal49Vessel>;
}

/**
 * Get Terminal49 API response for a container route
 * Returns shipping data from Shanghai to Los Angeles
 */
export function getTerminal49Route(
  containerNumber: string,
  expectedArrival: Date
): Terminal49RouteResponse {
  const now = new Date();
  const startDate = new Date(expectedArrival.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days before arrival

  // Calculate progress
  const totalJourney = expectedArrival.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = Math.min(Math.max(elapsed / totalJourney, 0), 1);

  // Define route waypoints with realistic timing
  const routeStages = [
    {
      progress: 0,
      port: {
        id: 'port-1',
        name: 'Shanghai, China',
        code: 'CNSHA',
        lat: 31.2304,
        lng: 121.4737,
      },
      vessel: { id: 'vessel-1', name: 'MSC MAYA', imo: '9321483' },
    },
    {
      progress: 0.2,
      port: {
        id: 'port-2',
        name: 'Busan, South Korea',
        code: 'KRPUS',
        lat: 35.1796,
        lng: 129.0756,
      },
      vessel: { id: 'vessel-1', name: 'MSC MAYA', imo: '9321483' },
    },
    {
      progress: 0.5,
      port: {
        id: 'port-3',
        name: 'Yokohama, Japan',
        code: 'JPYOK',
        lat: 35.4437,
        lng: 139.6380,
      },
      vessel: { id: 'vessel-1', name: 'MSC MAYA', imo: '9321483' },
    },
    {
      progress: 1.0,
      port: {
        id: 'port-4',
        name: 'Los Angeles, USA',
        code: 'USLAX',
        lat: 33.7701,
        lng: -118.1937,
      },
      vessel: { id: 'vessel-1', name: 'MSC MAYA', imo: '9321483' },
    },
  ];

  const routeLocations: Terminal49RouteLocation[] = [];
  const ports: Terminal49Port[] = [];
  const vessels: Terminal49Vessel[] = [];

  routeStages.forEach((stage, index) => {
    const isCompleted = progress >= stage.progress;
    const isPast = progress > stage.progress;
    const isCurrent = !isPast && index === routeStages.findIndex(s => s.progress > progress);

    const arrivalTime = new Date(startDate.getTime() + totalJourney * stage.progress);
    const departureTime = index < routeStages.length - 1
      ? new Date(startDate.getTime() + totalJourney * routeStages[index + 1].progress * 0.95)
      : null;

    // Create route location
    routeLocations.push({
      id: `route-location-${index + 1}`,
      type: 'route_location',
      attributes: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inbound_scac: index > 0 ? 'MSCU' : null,
        inbound_mode: index > 0 ? 'vessel' : null,
        inbound_eta_at: index > 0 ? arrivalTime.toISOString() : null,
        inbound_ata_at: isPast ? arrivalTime.toISOString() : null,
        inbound_voyage_number: index > 0 ? `${containerNumber.slice(0, 4)}${index}E` : null,
        outbound_scac: index < routeStages.length - 1 ? 'MSCU' : null,
        outbound_mode: index < routeStages.length - 1 ? 'vessel' : null,
        outbound_etd_at: departureTime ? departureTime.toISOString() : null,
        outbound_atd_at: isPast && departureTime ? departureTime.toISOString() : null,
        outbound_voyage_number: index < routeStages.length - 1 ? `${containerNumber.slice(0, 4)}${index + 1}E` : null,
      },
      relationships: {
        location: {
          data: {
            id: stage.port.id,
            type: 'port',
          },
        },
        inbound_vessel: {
          data: index > 0 ? {
            id: stage.vessel.id,
            type: 'vessel',
          } : null,
        },
        outbound_vessel: {
          data: index < routeStages.length - 1 ? {
            id: stage.vessel.id,
            type: 'vessel',
          } : null,
        },
      },
    });

    // Create port data
    ports.push({
      id: stage.port.id,
      type: 'port',
      attributes: {
        name: stage.port.name,
        nickname: stage.port.name.split(',')[0],
        code: stage.port.code,
        country_code: stage.port.code.substring(0, 2),
        latitude: stage.port.lat,
        longitude: stage.port.lng,
      },
    });

    // Create vessel data
    if (!vessels.find(v => v.id === stage.vessel.id)) {
      vessels.push({
        id: stage.vessel.id,
        type: 'vessel',
        attributes: {
          name: stage.vessel.name,
          imo: stage.vessel.imo,
          mmsi: '477123456',
          call_sign: 'WNCG',
        },
      });
    }
  });

  return {
    data: {
      id: `route-${containerNumber}`,
      type: 'route',
      attributes: {
        id: `route-${containerNumber}`,
        created_at: startDate.toISOString(),
        updated_at: new Date().toISOString(),
      },
      relationships: {
        route_locations: {
          data: routeLocations.map(rl => ({
            id: rl.id,
            type: 'route_location',
          })),
        },
      },
    },
    included: [
      ...routeLocations,
      ...ports,
      ...vessels,
    ],
  };
}

/**
 * Get current location from Terminal49 route data
 */
export function getCurrentLocationFromRoute(route: Terminal49RouteResponse) {
  const now = new Date();
  const routeLocations = route.included.filter(
    item => item.type === 'route_location'
  ) as Terminal49RouteLocation[];

  // Find the current location (last completed location)
  const currentLocation = routeLocations.find(rl => {
    const ata = rl.attributes.inbound_ata_at;
    const atd = rl.attributes.outbound_atd_at;
    const etd = rl.attributes.outbound_etd_at;

    // Has arrived but not departed yet
    if (ata && !atd) return true;

    // Has departed but next location hasn't been reached
    if (atd && etd) {
      const departureTime = new Date(atd);
      return now >= departureTime;
    }

    return false;
  }) || routeLocations[0];

  const port = route.included.find(
    item => item.type === 'port' && item.id === currentLocation.relationships.location.data.id
  ) as Terminal49Port;

  return {
    name: port?.attributes.name || 'Unknown',
    code: port?.attributes.code || '',
    latitude: port?.attributes.latitude || 0,
    longitude: port?.attributes.longitude || 0,
  };
}
