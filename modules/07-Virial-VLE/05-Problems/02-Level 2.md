

These problems are suitable as additional projects for students in a thermodynamics course (undergraduate level physical chemistry), or as regular projects in a graduate–level course in physical chemistry (thermodynamics, statistical mechanics, or quantum theory)

**Problem 1**

Calculate the quadrupole moment *Q* of CO<sub>2</sub> from first principles. Use a software package such
as Spartan (available in the Chemistry department’s computer lab) or the [webMO interface](http://www.ccr.buffalo.edu/display/WEB/WebMO) installed at UB's Center for Computational Research.  For basic information on webMO, a user’s guide and a tutorial, your course instructor will provide you
with details and arrange for access to the computing resources). Obtain [experimental geometry data](http://srdata.nist.gov/cccbdb/) for CO<sub>2</sub> from NIST. Use these geometry
parameters and compute the quadrupole moment at the following levels of theory: Hartree–Fock with a
(routine) 6-31G* basis (HF/6-31G*), Hartree–Fock with the good quality basis set (HF/cc-pVTZ), and with
the popular “B3LYP” density functional method, also using the two basis sets 6-31G* and cc-pVTZ. Using
the *B(T)* data from Problem 1 of the Level 1 problems, run the Virial module and obtain the potential
parameters Q, &sigma;, &epsilon;. Compare the results among each other and to the quite accurate CCSD/cc-pVTZ result
quoted in the background section. Which computational level yields best agreement with the quadrupole
moment derived from experimental B(T) data? Pick the computed value for *Q* that is most different from
the CCSD/cc-pVTZ result and run two simulations with VLE at 300 K (other parameters as in the VLE
Example) using this and the CCSD/cc-pVTZ for *Q*. How sensitive are the results to the differences in the
computed quadrupole moments? Would a fairly low level of theory such as HF/6-31G* do well enough or
is it necessary to determine the quadrupole moment with high accuracy?

**Problem 2**

Repeat the calculations of Problem 3 in Level 1 with [experimental data](http://webbook.nist.gov/chemistry/fluid/) for CO<sub>2</sub>. Generate a finer data grid with 1 K intervals
near the critical point (between 295 and 305 K) and use a more sparse data set at lower temperatures. The
result of the linear fit should be close to the experimentally determined critical point. Are the deviations
between your results and the experimental value within the standard deviations from the linear fit?

**Problem 3**

Convert the unit of the quadrupole moment, *debye*$\cdot$&Aring;, into [SI units](http://en.wikipedia.org/wiki/SI) of *C*$\cdot$m<sup>2</sup> (see Background section for details). Also, convert *debye*$\cdot$&Aring; into “atomic” units of *e*$\cdot$ bohr<sup>2</sup>. One *bohr* equals 0.529177 &Aring;, which is the Bohr radius of the hydrogen atom, and *e* is the unit charge. Is the *debye*$\cdot$&Aring; of comparable magnitude as the “atomic unit” of the quadrupole moment? What about the SI unit?

**Problem 4**

For the critical density and a temperature of 273 K, calculate the mean free path &lambda; of the
molecules in CO<sub>2</sub>. Use an estimate of 4 &Aring; for the molecular collision diameter. next, consider the potential parameters obtained in Problem 1. Plot the LJ part of the potential for $R / R_0$ values between 0.7 and 3.
What is the value of the interaction energy in units of *kT* between two CO<sub>2</sub> molecules at distance &lambda; obtained from considering only the LJ part of the potential. Also report the energies at 6 and 10 &Aring; separation. Next,
use the computed value for *Q* as quoted in the Background section and determine the magnitude of the
quadrupole–quadrupole interaction. As an estimate, let the average interaction between two CO<sub>2</sub> molecules
at distance *R* be on the order of $(4\pi\epsilon_0)^{-1}Q^2 / R^5$. Calculate the energy in units of Joule at distances &lambda;, 6 &Aring; and 10 &Aring;. Then convert the results to units of *kT* to compare with the energies from the LJ part of the
potential. At the three distances, are the LJ or the quadrupole interactions dominant? Given their relative
magnitude, which contribution may be negligible at low temperatures / at high temperatures?