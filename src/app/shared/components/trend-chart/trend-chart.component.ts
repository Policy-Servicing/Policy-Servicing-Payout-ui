import {
  Component, Input, OnChanges,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';

import { Chart } from 'chart.js';
import * as ChartJs from 'chart.js';
const ChartRuntime = (ChartJs as any).default || (ChartJs as any).Chart || ChartJs;
import { TrendPoint } from '../../../core/models/app.models';

@Component({
  selector: 'app-trend-chart',
  template: `<canvas #canvas></canvas>`,
  styles: [`
    :host { display: block; width: 100%; height: 220px; position: relative; }
    canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class TrendChartComponent implements AfterViewInit, OnChanges {
  @Input() data: TrendPoint[] = [];
  @ViewChild('canvas') canvasRef: ElementRef<HTMLCanvasElement>;

  private chart: Chart;

  ngAfterViewInit() { this.render(); }
  ngOnChanges() { this.render(); }

  private render() {
    if (!this.canvasRef || !this.data.length) { return; }
    if (this.chart) { this.chart.destroy(); }

    const labels = this.data.map(d => d.date);
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    this.chart = new ChartRuntime(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Extract',     data: this.data.map(d => d.extract),    borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.08)',  fill: true, tension: 0.4, pointRadius: 3 },
          { label: 'Approve',     data: this.data.map(d => d.approve),    borderColor: '#6366F1', backgroundColor: 'rgba(99,102,241,0.08)',   fill: true, tension: 0.4, pointRadius: 3 },
          { label: 'Tech Bucket', data: this.data.map(d => d.techBucket), borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.08)',   fill: true, tension: 0.4, pointRadius: 3 },
          { label: 'Sanction',    data: this.data.map(d => d.sanction),   borderColor: '#F97316', backgroundColor: 'rgba(249,115,22,0.08)',   fill: true, tension: 0.4, pointRadius: 3 },
          { label: 'Paid',        data: this.data.map(d => d.paid),       borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)',    fill: true, tension: 0.4, pointRadius: 3 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'top', labels: { boxWidth: 12, fontSize: 11 } },
        scales: {
          xAxes: [{ gridLines: { color: '#F1F5F9' }, ticks: { fontSize: 11 } }],
          yAxes: [{ gridLines: { color: '#F1F5F9' }, ticks: { fontSize: 11, beginAtZero: true } }]
        },
        tooltips: { mode: 'index', intersect: false }
      }
    } as any);
  }
}
