<!--
  - Copyright 2019 SpinalCom - www.spinalcom.com
  -
  -  This file is part of SpinalCore.
  -
  -  Please read all of the following terms and conditions
  -  of the Free Software license Agreement ("Agreement")
  -  carefully.
  -
  -  This Agreement is a legally binding contract between
  -  the Licensee (as defined below) and SpinalCom that
  -  sets forth the terms and conditions that govern your
  -  use of the Program. By installing and/or using the
  -  Program, you agree to abide by all the terms and
  -  conditions stated or referenced herein.
  -
  -  If you do not agree to abide by these terms and
  -  conditions, do not demonstrate your acceptance and do
  -  not install or use the Program.
  -  You should have received a copy of the license along
  -  with this file. If not, see
  -  <http://resources.spinalcom.com/licenses.pdf>.
  -->

<template>
  <v-card dark class="plugin-spinal-linker">
    <v-toolbar dark>
      <v-toolbar-title v-if="searchOpen === false">{{
        nodeName
      }}</v-toolbar-title>
      <v-toolbar-title v-else="searchOpen === false">
        <v-text-field
          v-model="search"
          label="Search"
          dark
          flat
          solo-inverted
          hide-details
          clearable
        ></v-text-field>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="onToggleSearch">
        <v-icon>{{ searchOpen ? 'close' : 'search' }}</v-icon>
      </v-btn>
    </v-toolbar>

    <v-layout
      justify-space-between
      pa-3
      class="plugin-spinal-linker-layout spinal-scrollbar"
    >
      <v-text-field v-model="proxyRelationName" label="Relation Name" dark flat>
        <template v-slot:append>
          <v-btn
            v-if="relationName !== proxyRelationName"
            :loading="loadingUpdateRelations"
            small
            dark
            @click="setRelation"
            icon
            :disabled="proxyRelationName.length === 0"
          >
            <v-icon>check</v-icon>
          </v-btn>
        </template>
      </v-text-field>
      <v-treeview
        :items="items"
        :load-children="loadChildren"
        :open.sync="open"
        :search="search"
        item-key="id"
        item-text="name"
        item-children="children"
        open-on-click
        transition
        :hoverable="true"
      >
        <template v-slot:label="{ item }">
          <span class="spinal-linker-label-name">{{ item.name }}</span>
        </template>
        <template v-slot:append="{ item }">
          <v-btn v-if="item.linkedState === 0" icon small disabled>
            <v-icon v-text="`$vuetify.icons.loading`"></v-icon>
          </v-btn>
          <v-btn
            v-else-if="item.linkedState === 1"
            icon
            small
            @click.stop="unlinkNode(item)"
          >
            <v-icon>link_off</v-icon>
          </v-btn>
          <v-btn v-else icon small @click.stop="linkNode(item)">
            <v-icon>link</v-icon>
          </v-btn>
        </template>
      </v-treeview>
    </v-layout>
  </v-card>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { FileSystem } from 'spinal-core-connectorjs';

export default {
  name: 'SpinalLinker',
  data: function () {
    return {
      selectId: 0,
      relationName: '',
      proxyRelationName: '',
      relationType: '',
      searchOpen: false,
      search: '',
      items: [],
      open: [],
      linkedIds: [],
      loadingUpdateRelations: false,
    };
  },
  computed: {
    nodeName: function () {
      if (this.selectId)
        return (
          FileSystem._objects[this.selectId]?.info?.name?.get() || 'undefined'
        );
      return 'undefined';
    },
  },
  methods: {
    onToggleSearch() {
      this.searchOpen = !this.searchOpen;
      if (!this.searchOpen) {
        this.search = '';
      }
    },
    async setRelation() {
      this.loadingUpdateRelations = true;
      this.relationName = this.proxyRelationName;
      const sourceNode = FileSystem._objects[this.selectId];
      const childrenlinked = await sourceNode.getChildren(
        this.relationName,
        this.relationType
      );
      this.linkedIds = [];
      for (const child of childrenlinked) {
        this.linkedIds.push(child._server_id);
      }
      this.updateLinkedStates();
      this.loadingUpdateRelations = false;
    },
    updateLinkedStates() {
      const updateState = (item) => {
        if (this.linkedIds.find((id) => id === item.id)) {
          item.linkedState = 1;
        } else {
          item.linkedState = 2;
        }
        if (item.children) {
          item.children.forEach((child) => updateState(child));
        }
      };
      this.items.forEach((item) => updateState(item));
    },
    async linkNode(target) {
      const targetNode = FileSystem._objects[target.id];
      const sourceNode = FileSystem._objects[this.selectId];
      await sourceNode.addChild(
        targetNode,
        this.relationName,
        this.relationType
      );
      target.linkedState = 1;
      this.linkedIds.push(target.id);
    },
    unlinkNode(target) {
      const targetNode = FileSystem._objects[target.id];
      const sourceNode = FileSystem._objects[this.selectId];
      sourceNode.removeChild(targetNode, this.relationName, this.relationType);
      target.linkedState = 2;
      this.linkedIds = this.linkedIds.filter((id) => id !== target.id);
    },
    createItem(node, context) {
      const item = {
        id: node._server_id,
        name: node.info.name.get(),
        contextId: context._server_id,
        linkedState: 0, // 0: undefined, 1: linked, 2: not linked
        children: [],
      };
      if (this.linkedIds.find((id) => id === node._server_id)) {
        item.linkedState = 1;
      } else {
        item.linkedState = 2;
      }
      return item;
    },
    opened: async function (option) {
      this.relationName = option.relationName;
      this.proxyRelationName = option.relationName;
      this.relationType = option.relationType;
      const node = SpinalGraphService.getRealNode(option.selectedNode.id.get());
      this.selectId = node._server_id;
      this.items = [];
      const graph = SpinalGraphService.getGraph();
      const contexts = await graph.getChildren();
      for (const context of contexts) {
        this.items.push(this.createItem(context, context));
      }
      const childrenlinked = await node.getChildren(
        this.relationName,
        this.relationType
      );
      for (const child of childrenlinked) {
        this.linkedIds.push(child._server_id);
      }
    },
    closed: function () {},
    removed: function () {},
    async loadChildren(item) {
      const node = FileSystem._objects[item.id];
      const context = FileSystem._objects[item.contextId];
      const children = await node?.getChildrenInContext(context);
      const items = children.map((child) => this.createItem(child, context));
      if (items.length === 0) {
        delete item.children;
        return null;
      }
      item.children = items;
      return items;
    },
  },
};
</script>
<style>
.plugin-spinal-linker * {
  box-sizing: border-box;
}
</style>

<style scoped>
.plugin-spinal-linker {
  width: 100%;
  height: 100%;
}
.spinal-linker-label-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.plugin-spinal-linker-layout {
  height: calc(100% - 82px);
  overflow: auto;
  display: block;
}
</style>
