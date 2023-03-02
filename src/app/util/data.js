import { INVALID_INDEX } from '../constant/data';

export const equalsComparator = (a, b) => a === b;

export const listAdd = (list, index, element) => list.slice(0, index).concat(element).concat(list.slice(index));

export const listMerge = (leftList, rightList, comparator) => {
	let thisI;
	let otherI;

	let thisItem = null;
	let otherItem = null;

	let thisList = leftList;
	let otherList = rightList;
	let tempList;

	// let thisDone = false;
	let otherDone = false;

	for (thisI = 0; thisI < thisList.length; thisI++) {

		thisItem = thisList[thisI];
		
		// console.log(`0 thisI:${thisI} thisItem:${thisItem}`);

		let otherFound = INVALID_INDEX;

		for (otherI = 0; otherI < otherList.length; otherI++) {

			otherItem = otherList[otherI];
			
			// console.log(`1 otherI:${otherI} otherItem:${otherItem} comparator():${comparator(thisItem, otherItem)}`);

			if (comparator(thisItem, otherItem)) {

				otherFound = otherI;
				break;
			}
		}

		// console.log(`2 otherFound:${otherFound} >:${otherFound > INVALID_INDEX}`);

		if (otherFound > INVALID_INDEX) {

			// console.log(`3 ===:${otherFound === thisI}`);

			if (otherFound === thisI) {

				// console.log(`4 length:${thisList.length} ===:${(thisI + 1) === thisList.length}`);

				if ((thisI + 1) === thisList.length) {

					// console.log(`5 otherDone:${otherDone}`);
					
					// thisDone = true;
					if (otherDone) {
						break;
					} else {
						// thisDone = false;
						otherDone = true;
						tempList = thisList;
						thisList = otherList;
						otherList = tempList;
						thisI = INVALID_INDEX;
						continue;
					}
				}
				continue;
			} else {
				otherList = otherList.filter((_, index) => otherFound !== index);
				otherList = listAdd(otherList, thisI, otherItem);
				thisI = INVALID_INDEX;
				continue;
			}
		} else {
			otherList = listAdd(otherList, thisI, thisItem);
			// thisDone = false;
			otherDone = false;
			tempList = thisList;
			thisList = otherList;
			otherList = tempList;
			thisI = INVALID_INDEX;
			continue;
		}
	}

	return thisList;
};
