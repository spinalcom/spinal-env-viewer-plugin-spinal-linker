import {
  SpinalContextApp,
  spinalContextMenuService,
} from 'spinal-env-viewer-context-menu-service';
import {
  spinalPanelManagerService,
} from 'spinal-env-viewer-panel-manager-service';
import {
  SpinalGraphService,
  SpinalNode,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';
import {
  isShownParam
} from '../utilities'
export default class SpinalLinkerButton extends SpinalContextApp {
  constructor() {
    super('SpinalLinker', 'Open SpinalLinker', {
      icon: 'link',
      icon_type: 'in',
      backgroundColor: '#000000',
      fontColor: '#ffffff',
    });
  }

  isShown(option) {
    if (option.exist || option.selectedNode) {
      if (option.selectedNode instanceof SpinalNode) {
        return Promise.resolve(true);
      } else {
        if (
          option.hasOwnProperty('selectedNode') &&
          isShownParam.includes(option.selectedNode.type.get())
        ) {
          return Promise.resolve(true);
        }
      }
    }
    return Promise.resolve(-1);
  }

  action(option) {
    let selectedNode = option.selectedNode;

    if (option.selectedNode instanceof SpinalNode) {
      SpinalGraphService._addNode(option.selectedNode);
      selectedNode = SpinalGraphService.getInfo(option.selectedNode.getId());
    }
    const param = {
      relationName: 'hasEndPoint',
      relationType: SPINAL_RELATION_PTR_LST_TYPE,
      selectedNode: selectedNode,
    };
    spinalPanelManagerService.openPanel('plugin-spinal-linker', param);
  }
}

const TopBarName = 'GraphManagerSideBar';
const circularMenuName = 'circularMenu';

spinalContextMenuService.registerApp(TopBarName, new SpinalLinkerButton(), [3]);
spinalContextMenuService.registerApp(
  circularMenuName,
  new SpinalLinkerButton(), [3]
);
