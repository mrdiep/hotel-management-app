function cost(timeIn, timeOut, type, roomType, settings) {
    function getTotalTime() {
        var totalMinute = (timeOut.getTime() - timeIn.getTime()) / (1000 * 60)
        return totalMinute;
    }
	const THUE_GIO = '1';
	const THUE_NGAY = '2';
	const THUE_DEM = '3';
	
	const PHONG_LANH = '1';
	const PHONG_QUAT = '2';
	
    switch (type) {
        case THUE_GIO: // thue gio
            var arrData = {
                costSet: roomType === PHONG_LANH ? [
                    { from: 0, to: 75, cost: 50000 }
                ] : [
                    { from: 0, to: 75, cost: 40000 }
                ],
                extraCostPerHour: 10000
            };

            var totalTime = getTotalTime();
            if (totalTime < 0) return -1;

            var costData = arrData.costSet.filter(x => x.from <= totalTime && totalTime < x.to);

            if (costData.length === 1) {
                return costData[0].cost;
            } else if (costData.length === 0) {
                var maxTo = arrData.costSet.reduce((l, e) => l > e.to ? l : e.to, 0);
                var extraMinutes = totalTime - maxTo;
                var extraHour = Math.floor(extraMinutes / 60.0) + (extraMinutes % 60 < 5 ? 0 : 1);

                console.log('MaxTo: ', maxTo, totalTime / 60, extraMinutes, extraHour)

                var maxDefinedCost = arrData.costSet.reduce((l, e) => l > e.cost ? l : e.cost, 0);

                return extraHour * arrData.extraCostPerHour + maxDefinedCost;
            }
			break;
		case THUE_DEM:
            if (roomType === PHONG_LANH) return 150000;
			if (roomType === PHONG_QUAT) return 130000;
			
			break;
		case THUE_NGAY:
            if (roomType === PHONG_LANH) return 250000;
			if (roomType === PHONG_QUAT) return 200000;
			break;		

    }

    return 0;
}