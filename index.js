```javascript
// Simulador de Portafolio de Inversiones con Gráficas
// Ejecutar con: node index.js

const fs = require('fs');
const path = require('path');

// Clase para gestionar activos individuales
class Activo {
  constructor(nombre, simbolo, cantidadInicial, precioInicial) {
    this.nombre = nombre;
    this.simbolo = simbolo;
    this.cantidad = cantidadInicial;
    this.precioBase = precioInicial;
    this.precioActual = precioInicial;
    this.historialPrecios = [precioInicial];
    this.historialFechas = ['Día 0'];
  }

  simularCambio(porcentaje) {
    const cambio = 1 + (porcentaje / 100);
    this.precioActual = parseFloat((this.precioActual * cambio).toFixed(2));
    this.historialPrecios.push(this.precioActual);
    return this.precioActual;
  }

  agregarFecha(fecha) {
    this.historialFechas.push(fecha);
  }

  getValorTotal() {
    return parseFloat((this.cantidad * this.precioActual).toFixed(2));
  }

  getRetorno() {
    const retorno = ((this.precioActual - this.precioBase) / this.precioBase) * 100;
    return parseFloat(retorno.toFixed(2));
  }
}

// Clase para gestionar el portafolio completo
class Portafolio {
  constructor(nombrePortafolio, capitalInicial) {
    this.nombre = nombrePortafolio;
    this.capitalInicial = capitalInicial;
    this.activos = [];
    this.historialValorTotal = [capitalInicial];
    this.historialFechas = ['Día 0'];
  }

  agregarActivo(activo) {
    this.activos.push(activo);
  }

  getValorTotalActual() {
    return parseFloat(
      this.activos.reduce((total, activo) => total + activo.getValorTotal(), 0).toFixed(2)
    );
  }

  simularDia(cambios) {
    // cambios es un objeto: { "AAPL": 2.5, "GOOGL": -1.2 }
    this.activos.forEach((activo) => {
      if (cambios[activo.simbolo] !== undefined) {
        activo.simularCambio(cambios[activo.simbolo]);
      }
    });

    const nuevoValor = this.getValorTotalActual();
    this.historialValorTotal.push(nuevoValor);
  }

  agregarFecha(fecha) {
    this.historialFechas.push(fecha);
    this.activos.forEach((activo) => activo.agregarFecha(fecha));
  }

  getRetornoTotal() {
    const retorno = ((this.getValorTotalActual() - this.capitalInicial) / this.capitalInicial) * 100;
    return parseFloat(retorno.toFixed(2));
  }

  getDistribucion() {
    const valorTotal = this.getValorTotalActual();
    const distribucion = {};
    this.activos.forEach((activo) => {
      const porcentaje = (activo.getValorTotal() / valorTotal) * 100;
      distribucion[activo.simbolo] = parseFloat(porcentaje.toFixed(2));
    });
    return distribucion;
  }

  generarReporte() {
    let reporte = `\n${'='.repeat(70)}\n`;
    reporte += `REPORTE DEL PORTAFOLIO: ${this.nombre}\n`;
    reporte += `${'='.repeat(70)}\n\n`;

    reporte += `Capital Inicial: $${this.capitalInicial.toFixed(2)}\n`;
    reporte += `Valor Actual: $${this.getValorTotalActual().toFixed(2)}\n`;
    reporte += `Retorno Total: ${this.getRetornoTotal()}%\n\n`;

    reporte += `${'ACTIVOS EN EL PORTAFOLIO'.padEnd(40)}${'VALOR'.padStart(20)}\n`;
    reporte += `${'-'.repeat(70)}\n`;

    this.activos.forEach((activo) => {
      const valor = activo.getValorTotal();
      const retorno = activo.getRetorno();
      reporte += `${activo.nombre.padEnd(25)} | Qty: ${activo.cantidad
        .toString()
        .padEnd(5)} | $${valor.toFixed(2).padStart(12)} | ${retorno > 0 ? '+' : ''}${retorno.toFixed(2)}%\n`;
    });

    reporte += `\n${'DISTRIBUCIÓN DEL PORTAFOLIO'.padEnd(40)}${'%'.padStart(10)}\n`;
    reporte += `${'-'.repeat(70)}\n`;

    const distribucion = this.getDistribucion();
    Object.entries(distribucion).forEach(([simbolo, porcentaje]) => {
      reporte += `${simbolo.padEnd(30)}${porcentaje.toFixed(2).padStart(10)}%\n`;
    });

    reporte += `\n${'='.repeat(70)}\n`;
    return reporte;
  }
}

// Generador de gráficas ASCII
class GraficadorASCII {
  static generarGraficaLinea(datos, titulo, ancho = 70, alto = 15) {
    if (datos.length === 0) return '';

    const minVal = Math.min(...datos);
    const maxVal = Math.max(...datos);
    const