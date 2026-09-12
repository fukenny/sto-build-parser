import test from 'node:test';
import assert from 'node:assert/strict';
import {conditions,conditionKey,tfos,battleTypes} from '../public/patrols.js';
test('space TFO catalog and legacy DSE matching preserve saved labels',()=>{
 assert.deepEqual(battleTypes,['Patrol','TFO','Other']);assert.equal(new Set(tfos).size,tfos.length);
 assert.ok(tfos.includes('Infected: The Conduit'));assert.ok(!tfos.includes('Into the Hive'));
 const old={battleType:'DSE',missionName:'  Test   encounter ',difficulty:'Elite',party:'Solo'};
 const updated=conditions(old);assert.equal(updated.battleType,'Other');assert.equal(updated.missionName,'Test encounter');assert.equal(conditionKey(old),conditionKey(updated));
 assert.notEqual(conditionKey(updated),conditionKey({...updated,battleType:'TFO'}));
});
