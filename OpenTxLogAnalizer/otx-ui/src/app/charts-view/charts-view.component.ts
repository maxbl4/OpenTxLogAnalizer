import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'otx-charts-view',
  template: `
    Coming soon
    <!--            <ngx-charts-line-chart-->
    <!--              [view]="view"-->
    <!--              [results]="results"-->
    <!--              [legend]="true"-->
    <!--              [showXAxisLabel]="true"-->
    <!--              [showYAxisLabel]="true"-->
    <!--              [xAxis]="true"-->
    <!--              [yAxis]="true"-->
    <!--              xAxisLabel="Index"-->
    <!--              yAxisLabel=""-->
    <!--            >-->
    <!--            </ngx-charts-line-chart>-->
  `,
  styles: [
  ]
})
export class ChartsViewComponent implements OnInit {
  view: [number, number] = [700, 300];
  results = [
    {
      "name": "Germany",
      "series": [
        {
          "name": "1990",
          "value": 62000000
        },
        {
          "name": "2010",
          "value": 73000000
        },
        {
          "name": "2011",
          "value": 89400000
        }
      ]
    }];
  constructor() { }

  ngOnInit(): void {
  }

}
