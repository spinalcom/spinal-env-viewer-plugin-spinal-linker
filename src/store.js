import Vuex from "vuex";
import Vue from 'vue';
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

Vue.use( Vuex );

let store = new Vuex.Store( {

  state: {
    nodes: {},
    contextsId: [],
    relationNames: [],
    inspectedNodeId: "",
    relationName: '',
    relationType: 0,
    activeNode: {},
    childrenIds: [],
    linkerChildId: [],

    defaultRelationType: '',
    defaultRelationName: '',
    allowManualConfig: false,
    displayRelationNameSelector: false,
    displayRelationNameAdd: false,
  },

  mutations: {
    /*********************/
    /* GRAPH VIEWER INIT */
    /*********************/
    ADD_CONTEXT_ID: ( state, contextId ) => {
      if (!state.contextsId.includes( contextId )) {
        state.contextsId.push( contextId );
      }
    },

    REMOVE_CONTEXT_ID: ( state, contextId ) => {
      if (state.contextsId.includes( contextId )) {
        state.contextsId.splice( state.contextsId.indexOf( contextId ), 1 );
      }
    },
    ADD_CONTEXTS_ID: ( state, contextIds ) => {
      for (let i = 0; i < contextIds.length; i++) {
        if (!state.contextsId.includes( contextIds[i] )) {
          state.contextsId.push( contextIds[i] );
        }
      }
    },


    /******************************/
    /* SPINAL LINKER MAIN FEATURE */
    /******************************/
    LINK_NODE: ( state ) => {
      SpinalGraphService
        .addChild( state.inspectedNodeId, state.activeNode.nodeId, state.relationName, state.relationType )
        .then( () => console.log( 'active', state.activeNode ) );

    },

    UNLINK_NODE: ( state, childId ) => {
      if (state.nodes.hasOwnProperty( state.inspectedNodeId ) && state.nodes.hasOwnProperty( childId )) {
        state.nodes[state.inspectedNodeId].removeChild( state.nodes[childId], state.relationName, state.relationType );
      }
    },

    REMOVE_FROM_GRAPH: ( state, id ) => {
      SpinalGraphService.removeFromGraph( id );

    },

    INIT:(state, option) => {
      for (let key in option) {
        if (option.hasOwnProperty( key ) && state.hasOwnProperty(key)){
          state[key] = option[key];
        }
      }
    },


    /*******************************/
    /* SPINAL LINKER CONFIGURATION */
    /*******************************/
    SET_RELATION_TYPE: ( state, relationType ) => {
      state.relationType = relationType;
    },

    SET_RELATION_NAME: ( state, relationName ) => {
      state.relationName = relationName;
    },

    SET_INSPECTED_NODE: ( state, inspectedNode ) => {
      state.inspectedNodeId = inspectedNode.id.get();
      const relationNames = SpinalGraphService.getRelationNames( state.inspectedNodeId );
      for (let i = 0; i < state.relationNames.length; i++) {
        state.relationNames.pop();
      }
      for (let i = 0; i < relationNames.length; i++) {
        state.relationNames.push( relationNames[i] );
      }
      console.log( state.relationNames );
    },

    SET_NODES: ( state, nodes ) => {
      console.log( nodes );
      for (let key in nodes) {
        if (nodes.hasOwnProperty( key )) {
          const node = nodes[key];
          if (!state.nodes.hasOwnProperty( node.getId().get() )) {
            state.nodes[node.getId().get()] = SpinalGraphService.getInfo( node.getId().get() );
            state.childrenIds.push( node.getId().get() );
          }
        }
      }
    },

    ADD_NODE: ( state, node ) => {
      if (!state.nodes.hasOwnProperty( node.id.get() )) {
        state.nodes[node.id.get()] = SpinalGraphService.getInfo( node.id.get() );
        state.childrenIds.push( node.id.get() );
      }
    },

    SET_ACTIVE_NODE: ( state, node ) => {
      state.activeNode = node;
    },

    SET_LINKER_CHILDREN: ( state, ids ) => {
      while (state.linkerChildId.length > 0) {
        state.linkerChildId.pop();
      }

      for (let i = 0; i < ids.length; i++) {
        state.linkerChildId.push( ids[i] );
      }
    }
  },

  actions: {

    pull_children: ( context, nodeId ) => {
      if (context.state.nodes.hasOwnProperty( nodeId )) {
        context.state.nodes.get( nodeId ).getChildren( [] )
          .then( children => {
            for (let i = 0; i < children.length; i++) {
              context.commit( 'ADD_NODE', children[i] );
            }
          } )
          .catch( e => console.error( e ) );
      }
    },
    onNodeSelected: ( context, event ) => {

    },

    getChildren: ( context, relationName ) => {
      context.commit('SET_RELATION_NAME', relationName);
      const inspectedId = context.state.inspectedNodeId;
      if (typeof inspectedId !== "undefined" && inspectedId !== "") {

        SpinalGraphService.getChildren( context.state.inspectedNodeId, [relationName] )
          .then( children => {
            const childrenIds = [];

            for (let i = 0; i < children.length; i++) {
              childrenIds.push( children[i].id.get() );
            }

            context.commit( 'SET_LINKER_CHILDREN', childrenIds );
          } );
      }
    }

  }

} );

export default store;