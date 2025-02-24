/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO Remove this when V6
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import EntityStixCoreRelationships from '../../common/stix_core_relationships/EntityStixCoreRelationships';
import StixDomainObjectKnowledge from '../../common/stix_domain_objects/StixDomainObjectKnowledge';
import StixCoreRelationship from '../../common/stix_core_relationships/StixCoreRelationship';
import StixSightingRelationship from '../../events/stix_sighting_relationships/StixSightingRelationship';
import { CityKnowledge_city$key } from './__generated__/CityKnowledge_city.graphql';

const cityKnowledgeFragment = graphql`
  fragment CityKnowledge_city on City {
    id
    name
    x_opencti_aliases
  }
`;

const CityKnowledge = ({ cityData }: { cityData: CityKnowledge_city$key }) => {
  const city = useFragment<CityKnowledge_city$key>(
    cityKnowledgeFragment,
    cityData,
  );
  const link = `/dashboard/locations/cities/${city.id}/knowledge`;
  return (
    <>
      <Routes>
        <Route
          path="/relations/:relationId"
          element={
            <StixCoreRelationship
              entityId={city.id}
              paddingRight={true}
            />
          }
        />
        <Route
          path="/sightings/:sightingId"
          element={
            <StixSightingRelationship
              entityId={city.id}
              paddingRight={true}
            />
          }
        />
        <Route
          path="/overview"
          element={
            <StixDomainObjectKnowledge
              stixDomainObjectId={city.id}
              stixDomainObjectType="City"
            />
          }
        />
        <Route
          path="/threats"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              isRelationReversed
              entityLink={link}
              stixCoreObjectTypes={[
                'Attack-Pattern',
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
                'Incident',
                'Malware',
                'Tool',
              ]}
            />
          }
        />
        <Route
          path="/related"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['related-to']}
              stixCoreObjectTypes={[
                'Threat-Actor',
                'Intrusion-Set',
                'Campaign',
                'Incident',
                'Malware',
                'Tool',
                'Vulnerability',
                'Individual',
                'Organization',
                'Sector',
                'Region',
                'Country',
                'Administrative-Area',
                'City',
                'Position',
              ]}
              entityLink={link}
              allDirections={true}
            />
          }
        />
        <Route
          path="/organizations"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Organization']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/areas"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Administrative-Area']}
              entityLink={link}
              isRelationReversed={false}
            />
          }
        />
        <Route
          path="/countries"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Country']}
              entityLink={link}
              isRelationReversed={false}
              enableEntitiesView={false}
            />
          }
        />
        <Route
          path="/regions"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['located-at']}
              stixCoreObjectTypes={['Region']}
              entityLink={link}
              isRelationReversed={false}
              enableEntitiesView={false}
            />
          }
        />
        <Route
          path="/threat_actors"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Threat-Actor']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/intrusion_sets"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Intrusion-Set']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/campaigns"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Campaign']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/incidents"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Incident']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/malwares"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Malware']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/attack_patterns"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Attack-Pattern']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/tools"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['targets']}
              stixCoreObjectTypes={['Tool']}
              entityLink={link}
              isRelationReversed={true}
            />
          }
        />
        <Route
          path="/observables"
          element={
            <EntityStixCoreRelationships
              entityId={city.id}
              relationshipTypes={['related-to', 'located-at']}
              stixCoreObjectTypes={['Stix-Cyber-Observable']}
              entityLink={link}
              allDirections={true}
              isRelationReversed={true}
            />
          }
        />
      </Routes>
    </>
  );
};

export default CityKnowledge;
